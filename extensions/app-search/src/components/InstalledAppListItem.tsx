/**
 * List item component for installed applications
 */

import { List, ActionPanel, Action } from "@raycast/api";
import { AppSearchResult } from "../types";
import { strings } from "../lib/strings";

interface InstalledAppListItemProps {
  result: AppSearchResult;
}

export function InstalledAppListItem({ result }: InstalledAppListItemProps) {
  return (
    <List.Item
      key={result.app.bundleId || result.app.path}
      title={result.app.name}
      subtitle={result.matchReason}
      accessories={[
        { text: `${result.matchScore}%`, tooltip: strings.matchScoreTooltip },
        ...(result.app.bundleId ? [{ text: result.app.bundleId, tooltip: strings.bundleIdTooltip }] : []),
      ]}
      icon={{ fileIcon: result.app.path }}
      actions={
        <ActionPanel>
          <Action.Open title={strings.launchApplication} target={result.app.path} />
          <Action.ShowInFinder title={strings.showInFinder} path={result.app.path} />
          <Action.CopyToClipboard
            title={strings.copyPath}
            content={result.app.path}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
          {result.app.bundleId && (
            <Action.CopyToClipboard
              title={strings.copyBundleId}
              content={result.app.bundleId}
              shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            />
          )}
        </ActionPanel>
      }
    />
  );
}
