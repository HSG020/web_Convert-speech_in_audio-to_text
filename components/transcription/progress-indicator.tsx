"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  stage: "uploading" | "processing" | "analyzing" | "completed" | "idle"
  progress: number
}

export function ProgressIndicator({ stage, progress }: ProgressIndicatorProps) {
  if (stage === "idle") return null

  const getStageText = () => {
    switch (stage) {
      case "uploading":
        return "正在上传音频文件... | Uploading audio file..."
      case "processing":
        return "正在处理音频... | Processing audio..."
      case "analyzing":
        return "识别说话人并分析内容... | Identifying speakers and analyzing content..."
      case "completed":
        return "转录完成！| Transcription completed!"
      default:
        return ""
    }
  }

  return (
    <div className="w-full max-w-md mx-auto my-8 space-y-3 animate-in fade-in duration-500">
      <div className="flex justify-between text-sm">
        <span>{getStageText()}</span>
        <span className={cn(
          "transition-opacity",
          stage === "completed" ? "opacity-0" : "opacity-100"
        )}>
          {Math.round(progress)}%
        </span>
      </div>
      <Progress 
        value={progress} 
        className="h-2" 
      />
    </div>
  )
}