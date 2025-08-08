import React from "react";
import Image from "next/image";
import group488 from "./group-488.png";

export const Box = () => {
  return (
    <div className="h-[58px] w-[247px]">
      <div className="fixed left-0 top-0 h-[58px] w-[247px]">
        <div className="relative h-[58px]">
          <div className="absolute left-20 top-0 flex h-[54px] w-[167px] flex-col items-start gap-2.5 py-0 pl-0 pr-[18px]">
            <div className="relative mb-[-1.00px] mr-[-6.16px] h-[55.32px] w-[155px]">
              <div className="relative h-[55px] w-[159px]">
                <div className="absolute left-0 top-0 w-full whitespace-nowrap text-center text-lg font-normal leading-[normal] tracking-[5.58px] text-black [font-family:'Arial-Regular',Helvetica]">
                  POLIZEI BW
                </div>

                <div className="absolute left-0 top-[22px] w-full whitespace-nowrap text-center text-[27px] font-black leading-[normal] tracking-[0] text-[#373a41] [font-family:'Inter-Black',Helvetica]">
                  FAHNDUNG
                </div>
              </div>
            </div>
          </div>

          <Image
            className="absolute left-0 top-0 h-[58px] w-[83px]"
            alt="Group"
            src={group488}
            width={83}
            height={58}
          />
        </div>
      </div>
    </div>
  );
};
