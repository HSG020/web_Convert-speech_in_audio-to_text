import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const XAI_API_KEY = process.env.XAI_API_KEY || 'xai-eltoN4tuY2q9O2fVTFFLcQspOU9sbypjuLZhTK9q1LauFsRbps9HbcP7ybTz4Eu08aUOgYHB1hggl2kS';

export async function POST(req: NextRequest) {
  try {
    const { question, transcript, conversationHistory = [] } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: '请输入问题' }, { status: 400 });
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: '没有可用的转录文本' }, { status: 400 });
    }

    console.log('==== AI问答请求开始 ====');
    console.log('用户问题:', question);
    console.log('转录段落数:', transcript.length);

    // 构建转录文本
    const transcriptText = transcript
      .map((segment: any) => `${segment.speaker}: ${segment.text}`)
      .join('\n');

    // 构建对话历史
    const messages = [
      {
        role: 'system',
        content: `你是一个专业的音频内容分析助手。用户会基于以下音频转录内容向你提问，请准确、详细地回答用户的问题。

音频转录内容：
${transcriptText}

请注意：
1. 回答要基于提供的转录内容
2. 如果问题超出转录内容范围，请说明无法从现有内容中获得答案
3. 保持回答的准确性和相关性
4. 用中文回答（除非用户明确要求其他语言）`
      },
      // 添加对话历史
      ...conversationHistory,
      {
        role: 'user',
        content: question
      }
    ];

    console.log('发送给AI的消息数量:', messages.length);

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-3-latest',
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('xAI API错误:', response.status, errorText);
      throw new Error(`xAI API 错误: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('AI响应为空');
    }

    console.log('AI回答长度:', aiResponse.length);
    console.log('==== AI问答请求完成 ====');

    return NextResponse.json({ 
      response: aiResponse,
      usage: data.usage
    });

  } catch (error: any) {
    console.error('❌ AI问答错误:', error);
    return NextResponse.json({ 
      error: error.message || 'AI问答失败' 
    }, { status: 500 });
  }
} 