import { ReactNode, useState } from 'react';
import { StyledTabs, StyledTabsHeader, StyledTabsLabel } from './styles';

interface IProps {
  tabs: {
    name: string;
    content: ReactNode;
    visible: boolean;
  }[];
}

export const Tabs = ({ tabs }: IProps) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  return (
    <StyledTabs>
      <StyledTabsHeader>
        {tabs.map((tab, i) => {
          if (tab.visible) {
            return (
              <StyledTabsLabel
                key={i}
                $active={activeTab === i}
                onClick={() => setActiveTab(i)}
              >
                {tab.name}
              </StyledTabsLabel>
            );
          }
        })}
      </StyledTabsHeader>
      {tabs[activeTab].content}
    </StyledTabs>
  );
};
