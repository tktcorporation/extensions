/**
 * Search App - Main Command
 * AI-powered application search for Raycast
 */

import { useState, useEffect } from "react";
import { List, Icon } from "@raycast/api";
import { useAppSearch } from "./hooks/useAppSearch";
import { InstalledAppListItem } from "./components/InstalledAppListItem";
import { AskAIListItem } from "./components/AskAIListItem";
import { SuggestionListItem } from "./components/SuggestionListItem";
import { strings } from "./lib/strings";

export default function SearchAppCommand() {
  const [searchText, setSearchText] = useState("");
  const [forceAI, setForceAI] = useState(false);

  const { results, isLoading, showAskAI } = useAppSearch({ searchText, forceAI });

  // Reset forceAI when search text changes
  useEffect(() => {
    setForceAI(false);
  }, [searchText]);

  const hasNoResults = results.installed.length === 0 && results.suggestions.length === 0;
  const showEmptyView = hasNoResults && searchText && !isLoading && !showAskAI;

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      searchBarPlaceholder={strings.searchBarPlaceholder}
      throttle
    >
      {showEmptyView ? (
        <List.EmptyView
          icon={Icon.MagnifyingGlass}
          title={strings.emptyViewTitle}
          description={strings.emptyViewDescription(searchText)}
        />
      ) : (
        <>
          {/* Installed Applications Section */}
          {results.installed.length > 0 && (
            <List.Section
              title={strings.installedSectionTitle(results.installed.length)}
              subtitle={strings.installedSectionSubtitle}
            >
              {results.installed.map((result) => (
                <InstalledAppListItem key={result.app.bundleId || result.app.path} result={result} />
              ))}
            </List.Section>
          )}

          {/* Ask AI Option for Short Queries */}
          {showAskAI && (
            <List.Section title={strings.askAISectionTitle}>
              <AskAIListItem onTriggerAI={() => setForceAI(true)} />
            </List.Section>
          )}

          {/* Suggestions Section */}
          {results.suggestions.length > 0 && (
            <List.Section
              title={strings.suggestionsSectionTitle(results.suggestions.length)}
              subtitle={strings.suggestionsSectionSubtitle}
            >
              {results.suggestions.map((suggestion, index) => (
                <SuggestionListItem key={`${suggestion.name}-${index}`} suggestion={suggestion} index={index} />
              ))}
            </List.Section>
          )}
        </>
      )}
    </List>
  );
}
