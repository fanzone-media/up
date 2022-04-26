import React, { ReactNode, useState } from 'react';
import { Accordion } from '../Accordion';
import { StyledTabsHeader, StyledTabsLabel } from './styles';

interface IProps {
  tabs: {
    name: string;
    content: ReactNode;
  }[];
}

export const TabedAccordion = ({ tabs }: IProps) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  return (
    <Accordion
      header={
        <StyledTabsHeader>
          {tabs.map((tab, i) => (
            <StyledTabsLabel
              key={i}
              $active={activeTab === i}
              onClick={() => setActiveTab(i)}
            >
              {tab.name}
            </StyledTabsLabel>
          ))}
        </StyledTabsHeader>
      }
      enableToggle
    >
      {tabs[activeTab].content}
    </Accordion>
  );
};
