"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Clock, Users, Volume2, Scissors, Loader, Languages } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/lib/language-context"
import { AiAssistantPanel } from "./ai-assistant-panel"
import { Brain } from "lucide-react"

interface Segment {
  speaker: string
  text: string
  startTime: number
  id?: number
  seek?: number
  end?: number
}

interface TranscriptDisplayProps {
  transcript: Segment[]
  visible: boolean
  outputLang: string
  transcriptLang: string
  isStreaming?: boolean
  splitInfo?: {wasSplit: boolean, totalSegments?: number} | null
}

const languages = [
  { value: "en", label: "English", labelZh: "英文" },
  { value: "zh", label: "Chinese (Mandarin)", labelZh: "中文（普通话）" },
  { value: "es", label: "Spanish", labelZh: "西班牙语" },
  { value: "fr", label: "French", labelZh: "法语" },
  { value: "de", label: "German", labelZh: "德语" },
  { value: "ja", label: "Japanese", labelZh: "日语" },
  { value: "ru", label: "Russian", labelZh: "俄语" },
  { value: "ar", label: "Arabic", labelZh: "阿拉伯语" },
  { value: "hi", label: "Hindi", labelZh: "印地语" },
  { value: "pt", label: "Portuguese", labelZh: "葡萄牙语" },
  { value: "it", label: "Italian", labelZh: "意大利语" },
];

export function TranscriptDisplay({ 
  transcript, 
  visible, 
  outputLang, 
  transcriptLang,
  isStreaming = false,
  splitInfo
}: TranscriptDisplayProps) {
  console.log('🖼️ TranscriptDisplay渲染:', {
    transcriptLength: transcript?.length || 0,
    visible,
    outputLang,
    transcriptLang,
    isStreaming,
    splitInfo,
    firstSegment: transcript?.[0]
  })

  const [translatedContent, setTranslatedContent] = useState<{ [key: number]: string }>({});
  const [translating, setTranslating] = useState(false);
  const [streamingSegments, setStreamingSegments] = useState<Segment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const { language } = useLanguage();

  // 计算是否需要显示翻译 - 移到所有useEffect之前
  const shouldShowTranslation = outputLang !== transcriptLang && outputLang !== 'auto';

  // 流式显示效果
  useEffect(() => {
    console.log('💫 流式显示useEffect:', { isStreaming, transcriptLength: transcript.length })
    
    if (!isStreaming || transcript.length === 0) {
      console.log('📋 设置非流式模式，直接显示所有segments')
      setStreamingSegments(transcript);
      return;
    }

    console.log('🎭 开始流式显示模式')
    // 重置状态
    setStreamingSegments([]);
    setCurrentSegmentIndex(0);
    setCurrentCharIndex(0);

    const streamSegments = () => {
      let segmentIndex = 0;
      let charIndex = 0;
      
      const interval = setInterval(() => {
        if (segmentIndex >= transcript.length) {
          clearInterval(interval);
          return;
        }

        const currentSegment = transcript[segmentIndex];
        if (!currentSegment) {
          clearInterval(interval);
          return;
        }

        setStreamingSegments(prev => {
          const newSegments = [...prev];
          // 如果是新的segment，添加到数组中
          if (!newSegments[segmentIndex]) {
            newSegments[segmentIndex] = {
              ...currentSegment,
              text: ''
            };
          }
          // 逐字添加文本
          if (charIndex < currentSegment.text.length) {
            newSegments[segmentIndex] = {
              ...currentSegment,
              text: currentSegment.text.substring(0, charIndex + 1)
            };
            charIndex++;
          } else {
            // 当前segment完成，移动到下一个
            newSegments[segmentIndex] = currentSegment;
            segmentIndex++;
            charIndex = 0;
            setCurrentSegmentIndex(segmentIndex);
          }
          return newSegments;
        });
      }, 20); // 更快的打字速度

      return () => clearInterval(interval);
    };

    const cleanup = streamSegments();
    return cleanup;
  }, [transcript, isStreaming]);

  // 自动翻译当输出语言改变时
  useEffect(() => {
    if (shouldShowTranslation && streamingSegments.length > 0 && !isStreaming) {
      translateContent();
    }
  }, [outputLang, streamingSegments, isStreaming]);

  // 翻译功能
  const translateContent = async () => {
    if (translating || outputLang === transcriptLang) return;
    
    setTranslating(true);
    try {
      const allText = streamingSegments.map(s => s.text).join('\n\n');
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: allText,
          targetLang: outputLang,
          sourceLang: transcriptLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        const translatedText = data.translation;
        
        if (translatedText) {
          const translatedParagraphs = translatedText.split('\n\n');
          
          const translated: { [key: number]: string } = {};
          streamingSegments.forEach((segment, index) => {
            if (translatedParagraphs[index]) {
              translated[segment.id || index] = translatedParagraphs[index];
            }
          });
          
          setTranslatedContent(translated);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || '翻译服务错误');
      }
    } catch (error) {
      console.error('翻译失败:', error);
      // 显示错误信息给用户
      const errorTranslated: { [key: number]: string } = {};
      streamingSegments.forEach((segment, index) => {
        errorTranslated[segment.id || index] = `翻译失败: ${error instanceof Error ? error.message : '未知错误'}`;
      });
      setTranslatedContent(errorTranslated);
    } finally {
      setTranslating(false);
    }
  };

  // 复制功能
  const copyToClipboard = async () => {
    const text = streamingSegments
      .map(segment => `${segment.speaker} (${formatTime(segment.startTime)}): ${segment.text}`)
      .join('\n\n');
    
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加toast提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 下载功能
  const downloadTranscript = () => {
    const text = streamingSegments
      .map(segment => `${segment.speaker} (${formatTime(segment.startTime)}): ${segment.text}`)
      .join('\n\n');
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speaker: string) => {
    const colors = ['bg-blue-100 text-blue-800', 'bg-green-100 text-green-800', 'bg-purple-100 text-purple-800'];
    const index = parseInt(speaker.replace('Speaker ', '')) - 1;
    return colors[index % colors.length];
  };

  if (!visible || transcript.length === 0) {
    console.log('🚫 TranscriptDisplay不显示:', { visible, transcriptLength: transcript.length })
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-full mx-auto"
    >
      <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-6">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Volume2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">转录结果</h2>
                <p className="text-white/80">Transcription Results</p>
              </div>
              {isStreaming && currentSegmentIndex < transcript.length && (
                <Badge variant="secondary" className="animate-pulse bg-white/20 text-white border-white/30">
                  转录中... {currentSegmentIndex + 1}/{transcript.length}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-white/90 bg-white/10 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm">
                <Users className="h-4 w-4" />
                {new Set(streamingSegments.map(s => s.speaker)).size} 位说话人
              </div>
              <div className="flex items-center gap-2 text-white/90 bg-white/10 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm">
                <Clock className="h-4 w-4" />
                {formatTime(Math.max(...streamingSegments.map(s => s.startTime)))}
              </div>
              {splitInfo?.wasSplit && (
                <div className="flex items-center gap-2 text-white/90 bg-white/10 rounded-full px-3 py-1.5 text-sm backdrop-blur-sm">
                  <Scissors className="h-4 w-4" />
                  已分割 {splitInfo.totalSegments} 段
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={copyToClipboard}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <Copy className="h-4 w-4 mr-2" />
              复制
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={downloadTranscript}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
            {shouldShowTranslation && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={translateContent}
                disabled={translating}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                {translating ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    翻译中...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    翻译
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <CardContent className="p-8">
          {/* 三栏等宽等高布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
            
            {/* 第一栏：原文转录 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 overflow-hidden h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Volume2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">原文转录</CardTitle>
                    <p className="text-white/80 text-sm">Original Transcription</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 min-h-0">
                <div className="space-y-3 h-full overflow-y-auto">
                  <AnimatePresence>
                    {streamingSegments.map((segment, index) => (
                      <motion.div
                        key={segment.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 shadow-sm border border-blue-200/50 dark:border-blue-700/50"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <Badge className={`${getSpeakerColor(segment.speaker)} text-xs px-2 py-1`}>
                              {segment.speaker}
                            </Badge>
                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                              {formatTime(segment.startTime)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                              {segment.text}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>

            {/* 第二栏：AI智能助手 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">AI智能助手</CardTitle>
                    <p className="text-white/80 text-sm">AI Assistant</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 h-full overflow-hidden">
                <div className="h-full">
                  <AiAssistantPanel transcript={streamingSegments} />
                </div>
              </CardContent>
            </Card>

            {/* 第三栏：翻译结果 */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 overflow-hidden h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Languages className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">翻译结果</CardTitle>
                    <p className="text-white/80 text-sm">Translation Results</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 min-h-0">
                {shouldShowTranslation ? (
                  Object.keys(translatedContent).length > 0 ? (
                    <div className="space-y-3 h-full overflow-y-auto">
                      <AnimatePresence>
                        {streamingSegments.map((segment, index) => {
                          const translatedText = translatedContent[segment.id || index];
                          if (!translatedText) return null;
                          
                          return (
                            <motion.div
                              key={`translated-${segment.id || index}`}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="bg-white/80 dark:bg-slate-800/80 rounded-lg p-3 shadow-sm border border-emerald-200/50 dark:border-emerald-700/50"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                  <Badge className={`${getSpeakerColor(segment.speaker)} text-xs px-2 py-1`}>
                                    {segment.speaker}
                                  </Badge>
                                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                                    {formatTime(segment.startTime)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                                    {translatedText}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <motion.div
                        animate={{ 
                          rotate: translating ? 360 : 0,
                          scale: translating ? [1, 1.1, 1] : 1
                        }}
                        transition={{ 
                          rotate: { duration: 2, repeat: translating ? Infinity : 0, ease: "linear" },
                          scale: { duration: 1, repeat: translating ? Infinity : 0 }
                        }}
                        className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4"
                      >
                        <Languages className="h-8 w-8 text-white" />
                      </motion.div>
                      <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {translating ? '正在翻译...' : '准备翻译'}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                        {translating 
                          ? 'AI正在将内容翻译成目标语言，请稍候...' 
                          : '选择不同的输出语言并点击翻译按钮开始'
                        }
                      </p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-4 bg-gradient-to-r from-slate-300 to-slate-400 rounded-full mb-4">
                      <Languages className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      无需翻译
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                      当前输出语言与音频语言相同，无需翻译
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}