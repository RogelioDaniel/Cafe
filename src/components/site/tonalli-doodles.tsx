export type TonalliDoodleProps = {
  className?: string;
};

const outline = "#25213F";
const cream = "#FFF3D1";
const maize = "#F5BD45";
const bougainvillea = "#D94B7D";
const leaf = "#4F8D58";
const clay = "#C96745";
const coffee = "#4A281E";
const sky = "#78B8F7";

export function TonalliCupDoodle({ className }: TonalliDoodleProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M49 36c-8-11 9-13 1-25M79 34c-8-11 10-13 2-25M108 37c-8-10 8-13 2-23" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="6" />
      <path d="M24 57h101l-7 56c-2 17-17 29-35 29H66c-18 0-33-12-35-29z" fill={maize} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M124 71c27-3 33 38 4 47-5 2-10 2-15 1l3-20c4 1 8 0 10-2 5-5 2-12-4-12" fill={bougainvillea} stroke={outline} strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
      <path d="M29 82c24 9 65 11 92 0l-3 25c-25 9-61 8-87 0z" fill={bougainvillea} />
      <path d="M29 82c24 9 65 11 92 0" fill="none" stroke={outline} strokeWidth="5" />
      <ellipse cx="61" cy="91" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <ellipse cx="94" cy="91" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <circle cx="64" cy="94" fill={outline} r="4" />
      <circle cx="91" cy="94" fill={outline} r="4" />
      <path d="M66 115c7 7 17 7 24 0" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="5" />
      <path d="M38 145c25 9 66 9 89 0" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
    </svg>
  );
}

export function TonalliBeanDoodle({ className }: TonalliDoodleProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M101 18c35 12 44 49 27 82-18 35-56 50-83 36-28-14-29-53-11-84 16-28 42-42 67-34z" fill={clay} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M101 20c-13 18-17 36-10 54 8 21-2 44-28 61" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M91 76c9-1 18 2 27 9" fill="none" stroke={bougainvillea} strokeLinecap="round" strokeWidth="9" />
      <ellipse cx="57" cy="68" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <ellipse cx="82" cy="58" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <circle cx="60" cy="70" fill={outline} r="4" />
      <circle cx="84" cy="61" fill={outline} r="4" />
      <path d="M59 90c8 4 15 2 20-5" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="5" />
      <path d="M29 88c-14 3-18 12-18 21M119 105c15 1 21 8 24 18" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M46 137c-7 7-11 12-12 17M103 137c8 7 13 12 15 17" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M122 34c15-8 25-3 29 11-14 5-24 2-29-11z" fill={leaf} stroke={outline} strokeLinejoin="round" strokeWidth="6" />
      <circle cx="18" cy="70" fill={maize} r="6" />
      <path d="M13 50l-6-7M22 48l2-10" stroke={outline} strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

export function TonalliConchaDoodle({ className }: TonalliDoodleProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M25 103C16 72 36 31 78 24c42-7 72 25 61 70-4 17-16 34-33 43-27 14-70-2-81-34z" fill={bougainvillea} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M29 80c30-22 67-28 107-16M25 105c34-16 72-18 106-7M47 40c18 23 27 56 24 91M81 26c14 25 22 61 15 108M112 35c7 22 9 46 2 73" fill="none" stroke={maize} strokeLinecap="round" strokeWidth="7" />
      <ellipse cx="60" cy="88" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <ellipse cx="94" cy="84" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <circle cx="63" cy="90" fill={outline} r="4" />
      <circle cx="91" cy="87" fill={outline} r="4" />
      <path d="M65 109c7 7 18 6 24-2" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="5" />
      <path d="M31 112c-12 1-19 8-22 19M128 111c12 1 19 8 22 18" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M52 139l-5 14M107 136l7 15" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M15 38l7-4-1-8 7 4 6-5 1 8 8 2-7 5 1 8-7-4-7 5v-8z" fill={leaf} stroke={outline} strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}

export function TonalliOllaDoodle({ className }: TonalliDoodleProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M52 39c-9-10 8-14 0-25M82 38c-8-11 9-14 1-26M110 40c-7-10 8-13 2-23" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="6" />
      <path d="M45 54c-12 5-20 15-21 30-2 31 13 60 55 61 42 0 59-28 57-59-1-15-9-27-22-32z" fill={clay} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M43 54c7-6 66-7 73 0 8 8-5 17-36 17-31 0-45-9-37-17z" fill={coffee} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M27 72c-20-3-24 34-4 42 5 2 9 2 13 1M133 72c19-2 24 32 5 41-5 2-9 2-13 1" fill={maize} stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M34 113c27 11 65 11 93 0" fill="none" stroke={maize} strokeLinecap="round" strokeWidth="8" />
      <ellipse cx="62" cy="92" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <ellipse cx="98" cy="92" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <circle cx="65" cy="95" fill={outline} r="4" />
      <circle cx="95" cy="95" fill={outline} r="4" />
      <path d="M68 116c7 6 17 6 24-1" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="5" />
      <path d="M75 128c-4-7 7-13 11-6 3 6-7 13-11 6z" fill={leaf} stroke={outline} strokeWidth="4" />
      <circle cx="145" cy="48" fill={bougainvillea} r="7" />
      <path d="M143 28v-9M132 34l-7-6M153 35l6-6" stroke={outline} strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

export function TonalliMolinilloDoodle({ className }: TonalliDoodleProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M72 10h17v33H72z" fill={maize} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M57 39h47l13 26-14 76H58L44 65z" fill={sky} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M48 67h66M52 89h58M56 113h50" fill="none" stroke={bougainvillea} strokeLinecap="round" strokeWidth="8" />
      <ellipse cx="69" cy="75" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <ellipse cx="94" cy="75" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <circle cx="72" cy="78" fill={outline} r="4" />
      <circle cx="91" cy="78" fill={outline} r="4" />
      <path d="M71 98c7 6 16 6 23-1" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="5" />
      <path d="M46 78c-17 3-23 11-26 24M114 78c17 3 23 11 26 24" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M65 141l-8 12M97 141l8 12" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M20 102l-9-4M140 102l9-4" stroke={maize} strokeLinecap="round" strokeWidth="6" />
    </svg>
  );
}

export function TonalliPiloncilloDoodle({ className }: TonalliDoodleProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M79 17c21 0 38 19 45 48l13 61c3 14-9 23-27 23H49c-18 0-30-9-27-23l13-61c7-29 23-48 44-48z" fill={clay} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M34 96c28 13 64 13 92 0M30 119c32 12 68 12 99 0" fill="none" stroke={maize} strokeLinecap="round" strokeWidth="7" />
      <ellipse cx="62" cy="75" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <ellipse cx="96" cy="75" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
      <circle cx="65" cy="78" fill={outline} r="4" />
      <circle cx="93" cy="78" fill={outline} r="4" />
      <path d="M67 96c7 7 17 7 24 0" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="5" />
      <path d="M31 82c-15 1-22 8-25 19M127 82c15 1 22 8 26 19" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <circle cx="17" cy="53" fill={bougainvillea} r="7" />
      <path d="M18 34v-9M7 42l-7-4M29 42l7-4" stroke={outline} strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}

export function TonalliCinnamonDoodle({ className }: TonalliDoodleProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="rotate(-18 80 80)">
        <rect x="47" y="18" width="67" height="125" rx="30" fill={clay} stroke={outline} strokeWidth="7" />
        <path d="M58 25c17 14 33 14 48 0M55 132c18-14 35-14 50 0" fill="none" stroke={maize} strokeLinecap="round" strokeWidth="7" />
        <path d="M62 20c12 15 25 15 38 0M61 141c13-14 27-14 40 0" fill="none" stroke={coffee} strokeLinecap="round" strokeWidth="5" />
        <ellipse cx="70" cy="72" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
        <ellipse cx="94" cy="72" fill={cream} rx="10" ry="12" stroke={outline} strokeWidth="5" />
        <circle cx="73" cy="75" fill={outline} r="4" />
        <circle cx="91" cy="75" fill={outline} r="4" />
        <path d="M71 94c7 6 15 6 22-1" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="5" />
      </g>
      <path d="M48 75c-17 6-23 16-22 29M113 72c16 2 25 10 29 24" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M57 140l-7 13M105 136l9 12" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M132 38l6 7 9-2-4 8 6 7-9 1-4 8-5-8-9-1 7-6-3-9z" fill={leaf} stroke={outline} strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}

export function TonalliTamalDoodle({ className }: TonalliDoodleProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 160 160"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M34 25c26 5 40 17 46 34 7-18 21-29 46-35-2 30-8 52-18 66 12 14 15 35 12 56H40c-3-21 0-42 12-56-10-15-16-36-18-65z" fill={leaf} stroke={outline} strokeLinejoin="round" strokeWidth="7" />
      <path d="M55 47c12 5 21 13 25 25 5-12 14-21 26-26M50 98c20 9 42 9 61 0" fill="none" stroke={maize} strokeLinecap="round" strokeWidth="7" />
      <path d="M55 67h51v64H55z" fill={maize} stroke={outline} strokeLinejoin="round" strokeWidth="6" />
      <ellipse cx="69" cy="87" fill={cream} rx="9" ry="11" stroke={outline} strokeWidth="5" />
      <ellipse cx="93" cy="87" fill={cream} rx="9" ry="11" stroke={outline} strokeWidth="5" />
      <circle cx="72" cy="90" fill={outline} r="4" />
      <circle cx="90" cy="90" fill={outline} r="4" />
      <path d="M70 108c7 6 15 6 21 0" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="5" />
      <path d="M55 87c-15 1-22 8-26 19M106 87c15 1 22 8 26 19" fill="none" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <path d="M65 146l-7 9M99 146l7 9" stroke={outline} strokeLinecap="round" strokeWidth="7" />
      <circle cx="20" cy="57" fill={bougainvillea} r="6" />
    </svg>
  );
}
