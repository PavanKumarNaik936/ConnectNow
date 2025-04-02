"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { avatarImages } from "../../../constants/index.js"
import { toast } from "sonner"

const MeetingCard = ({
  title,
  date,
  icon,
  isPreviousMeeting,
  buttonIcon1,
  buttonText,
  handleClick,
  link,
}) => {

  return (
    <section className="flex min-h-[200px] w-full flex-col justify-between rounded-[10px] bg-dark-1 px-4 py-6 xl:max-w-[450px]">
    {/* Meeting Details */}
    <article className="flex flex-col gap-4">
      <Image src={icon} alt="Meeting Type Icon" width={24} height={24} />
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm font-normal">{date}</p>
        </div>
      </div>
    </article>
  
    {/* Attendees */}
    <article className={cn("flex justify-center relative")}>
      <div className="relative flex w-full max-sm:hidden">
        {avatarImages.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`Attendee ${index + 1}`}
            width={32}
            height={32}
            className="rounded-full border border-dark-3"
            style={{ marginLeft: index > 0 ? -8 : 0 }}
          />
        ))}
        <div
          className="flex-center absolute left-[110px] size-8 rounded-full border-[4px] border-dark-3 bg-dark-4 text-xs"
          aria-label="Additional 5 attendees"
        >
          +5
        </div>
      </div>
  
      {/* Action Buttons */}
      {!isPreviousMeeting && (
        <div className="flex gap-2">
          <Button onClick={handleClick} className="rounded bg-blue-1 px-4 py-2 text-sm">
            {buttonIcon1 && (
              <Image src={buttonIcon1} alt="Join Meeting Icon" width={16} height={16} />
            )}
            &nbsp; {buttonText}
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast("Link Copied");
            }}
            className="bg-dark-4 px-4 py-2 text-sm"
          >
            <Image src="/icons/copy.svg" alt="Copy Meeting Link" width={16} height={16} />
            &nbsp; Copy Link
          </Button>
        </div>
      )}
    </article>
  </section>
  
  );
};

export default MeetingCard;
