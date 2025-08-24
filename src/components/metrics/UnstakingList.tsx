import { Clock, ExternalLink } from "lucide-react";
import { ConvertedUnstakingSnapshot } from "@/types/snapshots";
import { toLocaleDateStringFormat } from "@/utils/time";
import { formatUSDValue } from "@/lib/utils";

interface UnstakingListProps {
  data: ConvertedUnstakingSnapshot[];
  currentPrice: number;
  loading?: boolean;
}

export const UnstakingList = ({
  data,
  currentPrice,
  loading = false,
}: UnstakingListProps) => {
  const formatTokenAmount = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", toLocaleDateStringFormat);
  };

  const getTimeRemaining = (timestamp: number) => {
    const now = Date.now();
    const unlockTime = timestamp * 1000;
    const diffMs = unlockTime - now;

    if (diffMs < 0) return "Past due";

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffMinutes}m`;
    }
  };

  const formatTxHash = (hash: string) =>
    `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  const getEtherscanUrl = (txHash: string) =>
    `https://etherscan.io/tx/${txHash}`;

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 border rounded-lg animate-pulse"
          >
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div>
                <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                <div className="w-24 h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="w-20 h-4 bg-gray-200 rounded mb-1"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pending unlocks found
      </div>
    );
  }

  // Sort by unlock time (earliest first)
  const sortedData = [...data].sort((a, b) => a.cooldownEnd - b.cooldownEnd);

  return (
    <div className="space-y-3">
      {sortedData.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <div className="font-medium">
                {formatTokenAmount(item.shares)} sVSN (
                {formatUSDValue(item.shares * currentPrice)})
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Started: {formatDate(item.blockTimestamp)}</span>
                <a
                  href={getEtherscanUrl(item.transactionHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  title="View transaction on Etherscan"
                >
                  <span>{formatTxHash(item.transactionHash)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatDate(item.cooldownEnd)}</div>
            <div className="text-sm text-gray-600">
              {getTimeRemaining(item.cooldownEnd)}
            </div>
          </div>
        </div>
      ))}

      {data.length > 10 && (
        <div className="text-center text-sm text-gray-500 pt-4">
          Showing first 10 upcoming unlocks
        </div>
      )}
    </div>
  );
};
