import React from 'react';
import { noto_serif } from '@/app/fonts';

export const FeedbackDistributionTag = () => {
  return (
    <div>
      <div
        className={
          noto_serif.className +
          ' absolute right-[113px] top-8 bg-pink-500 w-[22px] h-[22px] rounded text-center text-white text-sm font-bold flex justify-center items-center italic'
        }
      >
        <p>C</p>
      </div>
      <div
        className={
          noto_serif.className +
          ' absolute right-[89px] top-8 bg-red-500 w-[22px] h-[22px] rounded text-center text-white text-sm font-bold flex justify-center items-center italic'
        }
      >
        <p>W</p>
      </div>
      <div
        className={
          noto_serif.className +
          ' absolute right-[65px] top-8 bg-orange-500 w-[22px] h-[22px] rounded text-center text-white text-sm font-bold flex justify-center items-center italic'
        }
      >
        <p>E</p>
      </div>
      <div
        className={
          noto_serif.className +
          ' absolute right-[41px] top-8 bg-amber-500 w-[22px] h-[22px] rounded text-center text-white text-sm font-bold flex justify-center items-center italic'
        }
      >
        <p>R</p>
      </div>
      <div
        className={
          noto_serif.className +
          ' absolute right-[17px] top-8 bg-stone-500 w-[22px] h-[22px] rounded text-center text-white text-sm font-bold flex justify-center items-center italic'
        }
      >
        <p>G</p>
      </div>
    </div>
  );
};
