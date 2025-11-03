/**
 * List item component for app suggestions (uninstalled apps)
 */

import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { AppSuggestion } from "../types";
import { strings } from "../lib/strings";

interface SuggestionListItemProps {
  suggestion: AppSuggestion;
  index: number;
}

export function SuggestionListItem({ suggestion, index }: SuggestionListItemProps) {
  return (
    <List.Item
      key={`${suggestion.name}-${index}`}
      title={suggestion.name}
      subtitle={suggestion.category}
      accessories={[{ text: suggestion.description }]}
      icon={Icon.Download}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser title={strings.searchOnWeb} url={suggestion.searchUrl} icon={Icon.MagnifyingGlass} />
          {suggestion.officialUrl && (
            <Action.OpenInBrowser
              title={strings.visitOfficialWebsite}
              url={suggestion.officialUrl}
              icon={Icon.Globe}
              shortcut={{ modifiers: ["cmd"], key: "o" }}
            />
          )}
          <Action.CopyToClipboard
            title={strings.copyAppName}
            content={suggestion.name}
            shortcut={{ modifiers: ["cmd"], key: "c" }}
          />
        </ActionPanel>
      }
    />
  );
}
