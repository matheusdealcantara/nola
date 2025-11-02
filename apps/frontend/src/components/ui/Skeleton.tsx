import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rect",
}) => {
  const baseStyles = "animate-pulse bg-gray-200";

  const variantStyles = {
    text: "h-4 rounded",
    rect: "rounded-lg",
    circle: "rounded-full",
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton variant="circle" className="w-10 h-10" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 mb-2" />
          <Skeleton variant="text" className="w-20 h-3" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-3/4 mb-4" />
      <Skeleton variant="text" className="w-24 h-3" />
    </div>
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <Skeleton variant="text" className="w-32 mb-3" />
      <Skeleton variant="text" className="w-48 h-8 mb-2" />
      <Skeleton variant="text" className="w-24 h-3 mb-4" />
      <Skeleton variant="rect" className="w-24 h-6" />
    </div>
  );
};
