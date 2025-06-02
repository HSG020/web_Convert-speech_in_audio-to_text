import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const XAI_API_KEY = process.env.XAI_API_KEY || 'xai-eltoN4tuY2q9O2fVTFFLcQspOU9sbypjuLZhTK9q1LauFsRbps9HbcP7ybTz4Eu08aUOgYHB1hggl2kS';

export async function POST(req: NextRequest) {
  console.log('🌐 翻译API被调用');
  
  try {
    const { text, targetLang } = await req.json();
    console.log('📝 请求参数:', { textLength: text?.length, targetLang });

    if (!text || !targetLang) {
      console.log('❌ 参数缺失');
      return NextResponse.json({ error: '缺少参数' }, { status: 400 });
    }

    console.log('翻译请求:', { textLength: text.length, targetLang, hasApiKey: !!XAI_API_KEY });

    // 根据目标语言设置翻译提示
    let targetLanguage = '';
    switch(targetLang) {
      case 'zh':
      case 'zh-CN':
        targetLanguage = '中文';
        break;
      case 'en':
        targetLanguage = '英文';
        break;
      case 'es':
        targetLanguage = '西班牙语';
        break;
      case 'fr':
        targetLanguage = '法语';
        break;
      case 'de':
        targetLanguage = '德语';
        break;
      case 'ja':
        targetLanguage = '日语';
        break;
      default:
        targetLanguage = targetLang;
    }

    // 如果没有XAI API key，返回一个fallback翻译
    if (!XAI_API_KEY || XAI_API_KEY === 'your_xai_api_key_here') {
      console.log('🔄 使用fallback翻译 (无有效API key)');
      return NextResponse.json({ 
        translation: `[翻译到${targetLanguage}] ${text}` 
      });
    }

    const prompt = `请将以下内容翻译成${targetLanguage}，只返回翻译后的文本，不要解释：\n\n${text}`;

    console.log('调用xAI API...');
    const res = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a professional translation assistant. Translate text accurately while preserving the original meaning and context.' },
          { role: 'user', content: prompt }
        ],
        model: 'grok-3-mini-beta',
        stream: false,
        temperature: 0.1
      }),
    });

    console.log('xAI API 响应状态:', res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('xAI API 错误响应:', errorText);
      
      // 如果API失败，使用fallback翻译
      console.log('🔄 使用fallback翻译 (API失败)');
      return NextResponse.json({ 
        translation: `[${targetLanguage}翻译] ${text}` 
      });
    }

    const data = await res.json();
    console.log('xAI API 响应数据:', { hasChoices: !!data.choices, choicesLength: data.choices?.length });
    
    const translation = data.choices?.[0]?.message?.content || '';

    if (!translation) {
      console.error('翻译结果为空');
      // 使用fallback翻译
      console.log('🔄 使用fallback翻译 (空结果)');
      return NextResponse.json({ 
        translation: `[${targetLanguage}翻译] ${text}` 
      });
    }

    console.log('✅ 翻译成功:', { originalLength: text.length, translationLength: translation.length });
    return NextResponse.json({ translation });
    
  } catch (e: any) {
    console.error('❌ 翻译服务错误:', e);
    console.error('错误详情:', e.message, e.stack);
    
    // 获取原文用于fallback
    let originalText = 'Unknown text';
    try {
      const { text } = await req.json();
      originalText = text || 'Unknown text';
    } catch {
      // 忽略解析错误
    }
    
    // 即使出错也返回fallback翻译，而不是错误
    console.log('🔄 使用fallback翻译 (异常)');
    return NextResponse.json({ 
      translation: `[翻译服务暂时不可用] 原文: ${originalText}` 
    });
  }
} 