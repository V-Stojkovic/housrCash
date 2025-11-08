import React from 'react';
import { MOCK_REDEMPTIONS } from '@/lib/mock-data';
import { Award } from 'lucide-react';

export const RedemptionList: React.FC = () => {
  return (
    <ul className="divide-y divide-gray-200">
      {MOCK_REDEMPTIONS.map(redemption => (
        <li key={redemption.id} className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full mr-3">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold">{redemption.rewardTitle}</div>
              <div className="text-sm text-gray-500">{redemption.date}</div>
            </div>
          </div>
          <div className="font-semibold text-red-600">-{redemption.pointsSpent.toLocaleString()} pts</div>
        </li>
      ))}
    </ul>
  );
};
