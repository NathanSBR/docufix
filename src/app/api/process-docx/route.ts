import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import JSZip from 'jszip';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const tmpDir = '/tmp';
  let inputPath = '';
  let outputPath = '';
  let pdfPath = '';
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const convertToPdf = formData.get('convertToPdf') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.docx')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser .docx' },
        { status: 400 }
      );
    }

    // Crear nombres de archivo únicos
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const baseName = file.name.replace(/\.docx$/i, '');
    const inputFileName = `input_${timestamp}_${randomId}.docx`;
    const outputFileName = `${baseName}_procesado.docx`;
    const pdfFileName = `${baseName}_procesado.pdf`;

    // Rutas temporales
    inputPath = path.join(tmpDir, inputFileName);
    outputPath = path.join(tmpDir, outputFileName);
    pdfPath = path.join(tmpDir, pdfFileName);

    // Guardar el archivo subido
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(inputPath, buffer);

    // Ruta al script Python
    const scriptPath = path.join(process.cwd(), 'scripts', 'process_docx.py');
    
    // Ejecutar el script Python para procesar el documento
    const { stdout, stderr } = await execAsync(
      `python3 "${scriptPath}" "${inputPath}" "${outputPath}"`,
      { timeout: 60000 }
    );

    // Limpiar archivo temporal de entrada
    await fs.unlink(inputPath).catch(() => {});
    inputPath = '';

    // Verificar el resultado del procesamiento
    if (!stdout.startsWith('SUCCESS')) {
      const error = stdout.replace('ERROR|', '') || stderr || 'Error desconocido';
      return NextResponse.json(
        { success: false, error: `Error al procesar: ${error}` },
        { status: 500 }
      );
    }

    const parts = stdout.trim().split('|');
    const quotesConverted = parseInt(parts[1]) || 0;
    const footnotesInserted = parseInt(parts[2]) || 0;

    // Verificar que el archivo de salida existe
    try {
      await fs.access(outputPath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'El archivo procesado no se generó correctamente' },
        { status: 500 }
      );
    }

    // Convertir a PDF si se solicita
    let pdfBuffer = null;
    if (convertToPdf) {
      try {
        await execAsync(
          `soffice --headless --convert-to pdf --outdir "${tmpDir}" "${outputPath}"`,
          { timeout: 120000 }
        );
        
        // Leer el PDF generado
        try {
          pdfBuffer = await fs.readFile(pdfPath);
        } catch (e) {
          console.error('PDF no generado:', e);
        }
      } catch (pdfError) {
        console.error('Error converting to PDF:', pdfError);
      }
    }

    // Leer el archivo docx procesado
    const docxBuffer = await fs.readFile(outputPath);
    
    // Limpiar archivos temporales
    await fs.unlink(outputPath).catch(() => {});
    outputPath = '';
    if (pdfPath) await fs.unlink(pdfPath).catch(() => {});

    // Si hay PDF, devolver un ZIP con ambos archivos
    if (pdfBuffer) {
      const zip = new JSZip();
      
      zip.file(outputFileName, docxBuffer);
      zip.file(pdfFileName, pdfBuffer);
      
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      
      return new NextResponse(zipBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${baseName}_procesado.zip"`,
          'X-Quotes-Converted': quotesConverted.toString(),
          'X-Footnotes-Inserted': footnotesInserted.toString()
        }
      });
    }
    
    // Si solo es DOCX, devolverlo directamente
    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${outputFileName}"`,
        'X-Quotes-Converted': quotesConverted.toString(),
        'X-Footnotes-Inserted': footnotesInserted.toString()
      }
    });

  } catch (error) {
    console.error('Error procesando documento:', error);
    
    // Limpiar archivos temporales si existen
    if (inputPath) await fs.unlink(inputPath).catch(() => {});
    if (outputPath) await fs.unlink(outputPath).catch(() => {});
    if (pdfPath) await fs.unlink(pdfPath).catch(() => {});
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
