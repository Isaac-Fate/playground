import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 16 25.89" className={cn("h-6 w-auto", className)}>
      <path
        fill="currentColor"
        d="M 0 0 L 16 0 L 16 9.888543819998318 L 16 12.555210486664985 L 2.6666666666666665 12.555210486664985 L 2.6666666666666665 25.88854381999832 L 0 25.88854381999832 L 0 9.888543819998318 L 13.333333333333334 9.888543819998318 L 13.333333333333334 2.6666666666666665 L 0 2.6666666666666665 Z"
      />

      {/* Triangle */}
      <path
        fill="currentColor"
        d="M 4.534189906848999 25.88854381999832 L 11.465810093151001 25.88854381999832 L 8.0 15.22187715333165 Z"
      />

      {/* Rectangle */}
      <path
        fill="currentColor"
        d="M 16 15.22187715333165 L 16 25.88854381999832 L 13.333333333333334 25.88854381999832 L 13.333333333333334 15.22187715333165 Z"
      />

      {/* Eyes */}
      <circle
        fill="currentColor"
        cx="2.5464400750007012"
        cy="6.277605243332493"
        r="1.3333333333333333"
      />
      <circle
        fill="currentColor"
        cx="10.786893258332633"
        cy="6.277605243332493"
        r="1.3333333333333333"
      />
    </svg>
  );
}
