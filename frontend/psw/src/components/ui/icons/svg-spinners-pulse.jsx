import * as React from "react";

export function PulseIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  ...props
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}>
      <circle cx="12" cy="12" r="0"><animate
        attributeName="r"
        calcMode="spline"
        dur="1.2s"
        keySplines=".52,.6,.25,.99"
        repeatCount="indefinite"
        values="0;11" /><animate
        attributeName="opacity"
        calcMode="spline"
        dur="1.2s"
        keySplines=".52,.6,.25,.99"
        repeatCount="indefinite"
        values="1;0" /></circle>
    </svg>
  );
}
