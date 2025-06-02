"use client"

import { useCallback, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileAudio, X, Clock, Scissors, AlertTriangle, Shield, Zap, Music } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { getAudioDuration, shouldSplitAudio, formatDuration } from "@/lib/audio-utils"

interface AudioUploaderProps {
  onFileSelected: (file: File) => void
  isProcessing: boolean
}

export function AudioUploader({ onFileSelected, isProcessing }: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [audioDuration, setAudioDuration] = useState<number | null>(null)
  const [willAutoSplit, setWillAutoSplit] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzeAudioFile = async (file: File) => {
    setIsAnalyzing(true)
    try {
      const duration = await getAudioDuration(file)
      setAudioDuration(duration)
      setWillAutoSplit(false)
    } catch (error) {
      console.error('分析音频文件失败:', error)
      setAudioDuration(null)
      setWillAutoSplit(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('请选择音频文件')
      return
    }

    setSelectedFile(file)
    setUploadProgress(0)
    
    // 分析音频文件
    await analyzeAudioFile(file)
    
    // 模拟上传进度
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("audio/")) {
      handleFileSelect(droppedFile)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setUploadProgress(0)
    setAudioDuration(null)
    setWillAutoSplit(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleProcessing = () => {
    if (selectedFile) {
      onFileSelected(selectedFile)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // 修复点击处理逻辑
  const handleUploadAreaClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isProcessing && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isProcessing}
      />
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group",
          isDragOver 
            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30" 
            : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900",
          isProcessing && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        {/* 背景动画效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative p-12 text-center">
          <motion.div
            animate={{ 
              y: isDragOver ? -10 : 0,
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? [0, -5, 5, 0] : 0
            }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="relative mx-auto w-20 h-20 mb-6">
              {/* 外圈动画 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-20"
              />
              
              {/* 中圈动画 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 opacity-30"
              />
              
              {/* 图标容器 */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl">
                <Upload className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-white dark:to-blue-200 bg-clip-text text-transparent mb-2">
                上传音频文件
              </h3>
              <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                拖放或点击选择音频文件进行专业转录
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                Drag and drop or click to select audio files for transcription
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {['MP3', 'WAV', 'M4A', 'FLAC', 'OGG', 'WEBM'].map((format) => (
                <motion.span
                  key={format}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-700/50"
                >
                  {format}
                </motion.span>
              ))}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-3 w-3" />
                <span>最大文件大小: 100MB</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-3 w-3" />
                <span>支持长音频自动分割处理</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={handleButtonClick}
              disabled={isProcessing}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              <Upload className="h-5 w-5" />
              选择音频文件
            </motion.button>
          </div>
        </div>

        {/* 边框动画效果 */}
        {isDragOver && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-20 animate-pulse" />
        )}
      </motion.div>

      {/* 文件选择成功后的处理按钮 */}
      {selectedFile && !isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <FileAudio className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-4 text-sm text-green-600 dark:text-green-400">
                  <span>{formatFileSize(selectedFile.size)} • Ready for transcription</span>
                  {audioDuration && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{Math.floor(audioDuration / 60)}:{String(Math.floor(audioDuration % 60)).padStart(2, '0')}</span>
                        {audioDuration > 360 && (
                          <div className="flex items-center gap-1 ml-2 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">长音频</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={removeFile}
                className="text-slate-600 hover:text-red-600"
              >
                <X className="h-4 w-4 mr-1" />
                移除
              </Button>
              <Button
                onClick={handleProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                开始转录
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}