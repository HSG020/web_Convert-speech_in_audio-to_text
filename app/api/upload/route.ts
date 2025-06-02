import { NextRequest, NextResponse } from 'next/server';

// 使用新的配置方式 - 路由处理程序配置
export const dynamic = 'force-dynamic';

/**
 * 处理文件上传请求
 * 由于我们需要直接将文件URL传递给Replicate API，
 * 此API路由会将文件转换为base64格式并返回一个临时的data URL
 */
export async function POST(request: NextRequest) {
  try {
    // 解析FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!file.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: '只接受音频文件' },
        { status: 400 }
      );
    }

    // 读取文件为ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    // 将文件转换为Base64编码
    const base64 = Buffer.from(buffer).toString('base64');
    
    // 创建data URL（这是一种临时解决方案，生产环境中应使用云存储）
    const dataUrl = `data:${file.type};base64,${base64}`;
    
    // 返回临时URL
    return NextResponse.json({ url: dataUrl });
  } catch (error) {
    console.error('文件上传处理错误:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
} 