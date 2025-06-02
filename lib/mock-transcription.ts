export interface TranscriptSegment {
  speaker: string
  text: string
  startTime: number
}

// Mock function to simulate the transcription process
export async function mockTranscribe(file: File, language: string): Promise<{
  transcript: TranscriptSegment[]
}> {
  // Simulate processing times based on file size
  const delay = Math.min(5000, file.size / 50000)
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transcript: mockTranscriptData
      })
    }, delay)
  })
}

// Mock data that simulates a realistic conversation transcript
export const mockTranscriptData: TranscriptSegment[] = [
  {
    speaker: "Speaker 1",
    text: "Welcome everyone to our quarterly review meeting. Today we'll be discussing the progress made in the last quarter and our goals for the upcoming one.",
    startTime: 0
  },
  {
    speaker: "Speaker 1",
    text: "Before we dive into the details, I'd like to thank everyone for their hard work and dedication during these challenging times.",
    startTime: 11.5
  },
  {
    speaker: "Speaker 2",
    text: "Thanks for the introduction. I'd like to start by presenting our financial results from Q2. Overall, we've seen a 15% increase in revenue compared to the previous quarter.",
    startTime: 22.3
  },
  {
    speaker: "Speaker 2",
    text: "This growth is primarily attributed to the successful launch of our new product line and expanded market reach in the APAC region.",
    startTime: 34.7
  },
  {
    speaker: "Speaker 3",
    text: "That's impressive. How are we doing compared to our annual targets?",
    startTime: 46.2
  },
  {
    speaker: "Speaker 2",
    text: "We're currently at 48% of our annual target, which puts us slightly ahead of schedule.",
    startTime: 52.5
  },
  {
    speaker: "Speaker 1",
    text: "Excellent. Now let's move on to the marketing initiatives. Sarah, would you like to take over?",
    startTime: 60.1
  },
  {
    speaker: "Speaker 4",
    text: "Sure. Our Q2 marketing campaigns resulted in a 22% increase in brand engagement and a 30% growth in our social media following.",
    startTime: 68.4
  },
  {
    speaker: "Speaker 4",
    text: "The webinar series we launched last month has been particularly successful, with over 5,000 participants across the three sessions.",
    startTime: 79.9
  },
  {
    speaker: "Speaker 3",
    text: "Are we planning to continue the webinar series in Q3? It seems like a cost-effective way to generate leads.",
    startTime: 92.3
  },
  {
    speaker: "Speaker 4",
    text: "Yes, we've already scheduled four more webinars for Q3, focusing on different aspects of our new product line.",
    startTime: 99.7
  },
  {
    speaker: "Speaker 1",
    text: "Great. Now let's discuss our product development roadmap. Wei, would you like to update us on the R&D progress?",
    startTime: 110.2
  },
  {
    speaker: "Speaker 5",
    text: "Thank you. We've completed the prototype phase for Project Aurora and we're now moving into beta testing. Initial feedback from internal testing has been very positive.",
    startTime: 120.5
  },
  {
    speaker: "Speaker 5",
    text: "We've also started conceptualizing Project Nebula, which will be our focus for Q4 and early next year.",
    startTime: 135.8
  },
  {
    speaker: "Speaker 3",
    text: "What's the timeline for Project Aurora's market release?",
    startTime: 147.2
  },
  {
    speaker: "Speaker 5",
    text: "We're aiming for a soft launch by the end of Q3, with full market release in early Q4, provided that the beta testing goes as planned.",
    startTime: 152.6
  },
  {
    speaker: "Speaker 1",
    text: "Sounds like we're making good progress across all departments. Let's now open the floor for questions and additional comments.",
    startTime: 168.9
  }
]