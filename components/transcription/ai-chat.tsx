'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, Loader2, Bot, User, Sparkles } from 'lucide-react';

interface Segment {
  speaker: string;
  text: string;
  startTime: number;
  id?: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  transcript: Segment[];
}

const QUICK_QUESTIONS = [
  '请总结一下这段音频的主要内容',
  '这段对话的关键点是什么？',
  '提取出音频中的重要信息',
  '这段内容讲了什么？',
  '有什么值得注意的地方吗？'
];

export function AiChat({ transcript }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  console.log('AiChat组件渲染，转录数据:', transcript.length);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || transcript.length === 0) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      // 构建对话历史（只保留最近10条消息以控制token使用）
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText.trim(),
          transcript,
          conversationHistory
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'AI回答失败');
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('AI聊天错误:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `抱歉，出现了错误：${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(question);
  };

  const handleQuickQuestion = (quickQ: string) => {
    sendMessage(quickQ);
  };

  if (transcript.length === 0) {
    console.log('转录数据为空，显示空状态');
    return (
      <Card className="border border-dashed">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>上传并转录音频后，即可开始AI问答</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('转录数据可用，显示AI聊天界面');
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg text-purple-700">🤖 AI 智能问答</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'}
          </Button>
        </div>
        <CardDescription className="text-purple-600">
          💡 基于音频转录内容，向AI提问或生成摘要
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* 明显的测试按钮 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              🚀 AI问答功能已就绪！点击下面按钮开始体验：
            </p>
            <Button
              onClick={() => handleQuickQuestion('请总结一下这段音频的主要内容')}
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  AI正在分析音频...
                </>
              ) : (
                '🤖 立即生成音频摘要'
              )}
            </Button>
          </div>
          
          {/* 快捷问题 */}
          {messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">更多快捷问题：</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUESTIONS.slice(1).map((q, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(q)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 对话历史 */}
          <ScrollArea className="h-64 w-full border rounded-md p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">还没有对话记录，开始提问吧！</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <Bot className="h-6 w-6 text-purple-500" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <User className="h-6 w-6 text-blue-500" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Bot className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI正在思考...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* 输入框 */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="请输入你的问题..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !question.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>

          {/* 清空对话 */}
          {messages.length > 0 && (
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMessages([])}
                disabled={isLoading}
                className="text-xs text-muted-foreground"
              >
                清空对话历史
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
} 