/**
 * List item component for triggering AI search
 */

import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { strings } from "../lib/strings";

interface AskAIListItemProps {
  onTriggerAI: () => void;
}

export function AskAIListItem({ onTriggerAI }: AskAIListItemProps) {
  return (
    <List.Item
      title={strings.askAITitle}
      subtitle={strings.askAISubtitle}
      icon={Icon.Stars}
      accessories={[{ text: strings.askAIAccessory, tooltip: strings.searchWithAI }]}
      actions={
        <ActionPanel>
          <Action title={strings.searchWithAI} icon={Icon.Stars} onAction={onTriggerAI} />
        </ActionPanel>
      }
    />
  );
}
