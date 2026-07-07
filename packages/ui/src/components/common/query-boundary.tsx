"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@repo/i18n";
import { Box } from "../ui/box";
import { Button, ButtonText } from "../ui/button";
import { Skeleton, SkeletonText } from "../ui/skeleton/index.web";
import { Text } from "../ui/text";
import { Spinner } from "../ui/spinner";

type QueryBoundaryProps = {
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  notFound?: boolean;
  notFoundTitle?: string;
  notFoundAction?: ReactNode;
  loadingRows?: number;
  children: ReactNode;
};

export function QueryBoundary({
  isLoading = false,
  isError = false,
  onRetry,
  notFound = false,
  notFoundTitle,
  notFoundAction,
  loadingRows = 4,
  children,
}: QueryBoundaryProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Box className="space-y-4" aria-busy={true} aria-live="polite">
        <Box className="flex items-center gap-3">
          <Spinner size="small" />
          <Text className="text-sm text-muted-foreground">{t("common.loading")}</Text>
        </Box>
        <Skeleton className="h-8 w-56" />
        <SkeletonText _lines={loadingRows} gap={3} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="rounded-xl border border-destructive/25 bg-destructive/5 p-5">
        <Text className="text-sm font-medium text-destructive">
          {t("errors.loadFailed")}
        </Text>
        {onRetry ? (
          <Button
            size="sm"
            variant="outline"
            className="mt-3"
            onPress={() => onRetry()}
          >
            <ButtonText>{t("common.retry")}</ButtonText>
          </Button>
        ) : null}
      </Box>
    );
  }

  if (notFound) {
    return (
      <Box>
        <Text className="text-lg font-semibold text-foreground">
          {notFoundTitle ?? t("errors.notFound")}
        </Text>
        {notFoundAction ? <Box className="mt-4">{notFoundAction}</Box> : null}
      </Box>
    );
  }

  return <>{children}</>;
}
