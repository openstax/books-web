import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import AllOrNone from '../../../../components/AllOrNone';
import Checkbox from '../../../../components/Checkbox';
import { textStyle } from '../../../../components/Typography/base';
import { match, not } from '../../../../fpUtils';
import theme from '../../../../theme';
import { isArchiveTree } from '../../../guards';
import * as selectContent from '../../../selectors';
import {
  archiveTreeContainsNode,
  archiveTreeSectionIsBook,
  archiveTreeSectionIsChapter,
  flattenArchiveTree,
  nodeHasId
} from '../../../utils/archiveTreeUtils';
import ColorIndicator from '../ColorIndicator';
import { mobileMargin, mobilePadding } from './constants';

interface Props {
  className?: string;
}

// tslint:disable-next-line:variable-name
const Row = styled.div`
  display: flex;
  flex-direction: row;
  ${theme.breakpoints.mobile(css`
    flex-direction: column;
    overflow: hidden;
  `)}
`;

// tslint:disable-next-line:variable-name
const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

// tslint:disable-next-line:variable-name
const ChapterTitle = styled.span`
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  margin-left: 0.8rem;

  > * {
    overflow: hidden;
  }

  .os-text {
    flex: 1;
    text-overflow: ellipsis;
  }

  .os-divider {
    margin: 0 0.4rem;
  }
`;

const chunk = <T extends any>(sections: T[]) => {
  const cutoff = Math.max(20, Math.ceil(sections.length / 2));
  return [sections.slice(0, cutoff), sections.slice(cutoff)].filter((arr) => arr.length > 0);
};

// tslint:disable-next-line:variable-name
const ChapterFilter = ({className}: Props) => {
  const book = useSelector(selectContent.book);
  const page = useSelector(selectContent.page);

  const sections = book ? flattenArchiveTree(book.tree).filter((section) =>
    (section.parent && archiveTreeSectionIsBook(section.parent))
    || archiveTreeSectionIsChapter(section)
  ) : [];
  const sectionIds = sections.map((chapter) => chapter.id);
  const currentChapter = sections.find((section) =>
    page && (
      nodeHasId(page.id, section) ||
      (
        isArchiveTree(section) && archiveTreeContainsNode(section, page.id)
      )
    )
  );
  const [selectedChapters, setSelectedChapters] = React.useState<string[]>(currentChapter ? [currentChapter.id] : []);

  return <div className={className} tabIndex={-1}>
    <AllOrNone
      onNone={() => setSelectedChapters([])}
      onAll={() => setSelectedChapters(sectionIds)}
    />
    <Row>
      {chunk(sections).map((sectionChunk, index) => <Column key={index}>
        {sectionChunk.map((section) => <Checkbox
          key={section.id}
          checked={selectedChapters.includes(section.id)}
          onChange={() => selectedChapters.includes(section.id)
            ? setSelectedChapters(selectedChapters.filter(not(match(section.id))))
            : setSelectedChapters([...selectedChapters, section.id])
          }
        >
          <ChapterTitle dangerouslySetInnerHTML={{__html: section.title}} />
        </Checkbox>)}
      </Column>)}
    </Row>
  </div>;
};

export default styled(ChapterFilter)`
  ${textStyle}
  background: ${theme.color.white};
  font-size: 1.4rem;
  padding: 0.8rem 1.6rem;
  outline: none;
  max-height: 72rem;
  overflow: auto;
  ${theme.breakpoints.mobile(css`
    &&& {
      left: -${mobilePadding}rem;
      max-width: calc(100vw - ${mobileMargin}rem * 2);
    }
  `)}

  ${AllOrNone} {
    margin: 0.8rem 0 0.8rem 0.8rem;
  }

  ${Checkbox} {
    padding: 0.8rem;
  }

  ${ColorIndicator} {
    margin: 0 1.6rem 0 1.6rem;
  }
`;
