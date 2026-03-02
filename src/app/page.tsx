"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  FileText, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowRight,
  Sparkles,
  FileDown,
  FileTextIcon,
  CloudUpload,
  Wand2,
  BookOpen,
  Quote,
  MessageSquareText,
  FileOutput,
  Rocket,
  FileArchive,
  File
} from "lucide-react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [convertToPdf, setConvertToPdf] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    downloadBlob?: Blob;
    downloadFileName?: string;
    docxBlob?: Blob;
    docxFileName?: string;
    pdfBlob?: Blob;
    pdfFileName?: string;
    stats?: {
      quotesConverted: number;
      footnotesInserted: number;
    };
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.docx')) {
        setFile(droppedFile);
        setResult(null);
      } else {
        setResult({
          success: false,
          message: "Por favor, sube un archivo .docx válido"
        });
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        setResult({
          success: false,
          message: "Por favor, sube un archivo .docx válido"
        });
      }
    }
  };

  const processDocument = async () => {
    if (!file) return;

    setProcessing(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('convertToPdf', convertToPdf.toString());

    try {
      const response = await fetch('/api/process-docx', {
        method: 'POST',
        body: formData,
      });

      // Obtener estadísticas de los headers
      const quotesConverted = parseInt(response.headers.get('X-Quotes-Converted') || '0');
      const footnotesInserted = parseInt(response.headers.get('X-Footnotes-Inserted') || '0');

      if (response.ok) {
        // Obtener el archivo como blob
        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type') || '';
        
        // Determinar el nombre del archivo
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = 'documento_procesado.zip';
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+)"/);
          if (match) fileName = match[1];
        }

        // Si es un ZIP (contiene PDF + DOCX), extraer los archivos individuales
        if (contentType.includes('zip') || fileName.endsWith('.zip')) {
          const JSZip = (await import('jszip')).default;
          const zip = await JSZip.loadAsync(blob);
          
          let docxBlob: Blob | undefined;
          let docxFileName: string | undefined;
          let pdfBlob: Blob | undefined;
          let pdfFileName: string | undefined;
          
          for (const [path, file] of Object.entries(zip.files)) {
            if (path.endsWith('.docx') && !file.dir) {
              docxBlob = await file.async('blob');
              docxFileName = path;
            } else if (path.endsWith('.pdf') && !file.dir) {
              pdfBlob = await file.async('blob');
              pdfFileName = path;
            }
          }
          
          setResult({
            success: true,
            message: "¡Documento procesado correctamente!",
            docxBlob,
            docxFileName,
            pdfBlob,
            pdfFileName,
            stats: {
              quotesConverted,
              footnotesInserted
            }
          });
        } else {
          // Solo DOCX
          setResult({
            success: true,
            message: "¡Documento procesado correctamente!",
            downloadBlob: blob,
            downloadFileName: fileName,
            stats: {
              quotesConverted,
              footnotesInserted
            }
          });
        }
      } else {
        // Intentar parsear como JSON para obtener el error
        try {
          const data = await response.json();
          setResult({
            success: false,
            message: data.error || "Error al procesar el documento"
          });
        } catch {
          setResult({
            success: false,
            message: "Error al procesar el documento"
          });
        }
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Error de conexión al procesar el documento"
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!result?.downloadBlob) return;
    
    const url = URL.createObjectURL(result.downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.downloadFileName || 'documento_procesado';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setFile(null);
    setResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
              <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-500/25">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                DocuFix
              </h1>
              <p className="text-sm text-slate-400">
                Transforma tus documentos con un clic
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-10 flex-1">
        <div className="max-w-3xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
              <Wand2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Procesamiento automático</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Comillas latinas + Notas al pie + PDF
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Sube tu documento Word y obtén la versión transformada al instante. 
              Sin complicaciones, sin programas adicionales.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-amber-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
                  <Quote className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Comillas latinas</h3>
                <p className="text-sm text-slate-400">
                  <code className="text-amber-300">" "</code> → <code className="text-amber-300">« »</code>
                </p>
              </div>
            </div>
            
            <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                  <MessageSquareText className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Notas al pie</h3>
                <p className="text-sm text-slate-400">
                  Insertadas en el texto
                </p>
              </div>
            </div>
            
            <div className="group relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-red-500/30 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
                  <FileOutput className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Exportar PDF</h3>
                <p className="text-sm text-slate-400">
                  Sin abrir Word
                </p>
              </div>
            </div>
          </div>

          {/* Upload Area */}
          <Card className="mb-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white">
                <CloudUpload className="h-5 w-5 text-emerald-400" />
                Subir documento
              </CardTitle>
              <CardDescription className="text-slate-400">
                Arrastra un archivo .docx o haz clic para seleccionarlo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <label
                  className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                    dragActive
                      ? "border-emerald-400 bg-emerald-500/10 scale-[1.02]"
                      : "border-slate-600 hover:border-emerald-400/50 hover:bg-slate-700/30"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${dragActive ? 'bg-emerald-500/20 scale-110' : 'bg-slate-700/50'}`}>
                      <Upload className={`w-8 h-8 transition-colors ${dragActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <p className="mb-2 text-lg text-slate-300">
                      <span className="font-semibold text-emerald-400">Haz clic para subir</span> o arrastra
                    </p>
                    <p className="text-sm text-slate-500">Solo archivos .docx</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".docx"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="border border-slate-600 rounded-2xl p-5 bg-slate-700/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-xl">
                        <FileText className="h-8 w-8 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-lg">
                          {file.name}
                        </p>
                        <p className="text-sm text-slate-400">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetUpload}
                      className="text-slate-400 hover:text-white hover:bg-slate-600"
                    >
                      Cambiar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PDF Option */}
          {file && (
            <Card className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <CardContent className="pt-5">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      id="convertPdf"
                      checked={convertToPdf}
                      onCheckedChange={(checked) => setConvertToPdf(checked as boolean)}
                      className="border-blue-400 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                    />
                  </div>
                  <div className="grid gap-1 leading-none flex-1">
                    <label
                      htmlFor="convertPdf"
                      className="text-base font-medium text-white cursor-pointer flex items-center gap-2"
                    >
                      <FileTextIcon className="h-5 w-5 text-red-400" />
                      Generar también versión PDF
                    </label>
                    <p className="text-sm text-slate-400">
                      Convierte automáticamente el documento procesado a PDF
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Process Button */}
          {file && !result?.success && (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-3 py-7 text-lg font-semibold shadow-xl shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02]"
              onClick={processDocument}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Procesando documento...
                </>
              ) : (
                <>
                  <Rocket className="h-6 w-6" />
                  Procesar documento
                  <ArrowRight className="h-6 w-6" />
                </>
              )}
            </Button>
          )}

          {/* Result */}
          {result && (
            <Card className={`mt-6 overflow-hidden ${result.success ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30' : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30'}`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-xl ${result.success ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {result.success ? (
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    ) : (
                      <XCircle className="h-7 w-7 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg font-semibold ${result.success ? 'text-emerald-300' : 'text-red-300'}`}>
                      {result.message}
                    </p>
                    
                    {result.stats && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        <Badge variant="outline" className="bg-slate-800/50 border-slate-600 text-slate-300 px-4 py-1.5 text-sm">
                          <Quote className="h-3.5 w-3.5 mr-2 text-amber-400" />
                          {result.stats.quotesConverted} comillas
                        </Badge>
                        <Badge variant="outline" className="bg-slate-800/50 border-slate-600 text-slate-300 px-4 py-1.5 text-sm">
                          <MessageSquareText className="h-3.5 w-3.5 mr-2 text-purple-400" />
                          {result.stats.footnotesInserted} notas
                        </Badge>
                      </div>
                    )}

                    {result.success && (result.downloadBlob || result.docxBlob) && (
                      <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        {/* Botón DOCX */}
                        <Button
                          size="lg"
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-3 flex-1 py-6 shadow-lg shadow-emerald-500/20"
                          onClick={() => {
                            const blob = result.docxBlob || result.downloadBlob;
                            const fileName = result.docxFileName || result.downloadFileName;
                            if (!blob) return;
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = fileName || 'documento_procesado.docx';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <FileText className="h-5 w-5" />
                          Descargar .docx
                        </Button>
                        
                        {/* Botón PDF (solo si existe) */}
                        {result.pdfBlob && (
                          <Button
                            size="lg"
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-3 flex-1 py-6 shadow-lg shadow-red-500/20"
                            onClick={() => {
                              if (!result.pdfBlob) return;
                              const url = URL.createObjectURL(result.pdfBlob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = result.pdfFileName || 'documento_procesado.pdf';
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <File className="h-5 w-5" />
                            Descargar .pdf
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator className="my-10 bg-slate-700/50" />

          {/* Bottom Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Download App */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Download className="h-5 w-5 text-emerald-400" />
                  </div>
                  Descargar aplicación
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Úsala sin conexión en tu PC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
                  asChild
                >
                  <a href="/docufix-app.zip" download>
                    <Download className="h-4 w-4" />
                    Descargar .zip
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Demo Document */}
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 border-slate-700/50 hover:border-blue-500/30 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  Documento de prueba
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Historia marítima con 17 notas al pie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
                  asChild
                >
                  <a href="/test-documento-lector.docx" download>
                    <Download className="h-4 w-4" />
                    Descargar .docx
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-slate-500">
            DocuFix — Procesamiento de documentos simplificado
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Creado por <span className="text-slate-400">Jonathan Stevens Betancourt</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
