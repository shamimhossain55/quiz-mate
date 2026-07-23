import Card from '@/components/ui/Card';
import { CheckCircle2, XCircle } from 'lucide-react';
import ReviewAnswer from './ReviewAnswer';

interface ReviewCardProps {
  index: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export default function ReviewCard({
  index,
  question,
  userAnswer,
  correctAnswer,
  isCorrect,
}: ReviewCardProps) {
  return (
    <Card className='rounded-3xl p-8 shadow-lg'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-blue-600'>
            Question {index + 1}
          </p>

          <h2 className='mt-2 text-2xl font-bold text-slate-900'>
            {question}
          </h2>
        </div>

        {isCorrect ? (
          <CheckCircle2 className='text-green-500' width={32} height={32} />
        ) : (
          <XCircle className='text-red-500' width={32} height={32} />
        )}
      </div>

      <div className='mt-8 space-y-4'>
        <ReviewAnswer
          label='Your Answer'
          answer={userAnswer}
          isCorrect={isCorrect}
        />

        <ReviewAnswer
          label='Correct Answer'
          answer={correctAnswer}
          isCorrect={true}
        />
      </div>
    </Card>
  );
}