import { Highlight, HighlightColorEnum } from '@openstax/highlighter/dist/api';
import React from 'react';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { Edit as EditIcon } from 'styled-icons/fa-solid/Edit';
import { ExternalLinkAlt as LinkIcon } from 'styled-icons/fa-solid/ExternalLinkAlt';
import { TrashAlt as TrashAltIcon } from 'styled-icons/fa-solid/TrashAlt';
import Dropdown, { DropdownItem, DropdownList } from '../../../../components/Dropdown';
import theme from '../../../../theme';
import { disablePrint } from '../../../components/utils/disablePrint';
import { book as bookSelector } from '../../../selectors';
import { findArchiveTreeNode } from '../../../utils/archiveTreeUtils';
import { getBookPageUrlAndParams } from '../../../utils/urlUtils';
import ColorPicker from '../ColorPicker';
import MenuToggle, { MenuIcon } from '../MenuToggle';

// tslint:disable-next-line:variable-name
export const StyledContextMenu = styled.div`
  ${disablePrint}

  ${Dropdown} {
    position: absolute;
    width: 150px;
    top: 1.2rem;
    right: 0;

    .focus-within ${MenuIcon} {
      color: ${theme.color.secondary.lightGray.darkest};
    }

    :focus-within ${MenuIcon} {
      color: ${theme.color.secondary.lightGray.darkest};
    }
  }

  ${ColorPicker} {
    margin: 0.6rem 0 0 0.6rem;
  }

  ${MenuToggle} {
    float: right;
    margin-right: 0.2rem;
  }

  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line: variable-name
const StyledDropdownList = styled(DropdownList)`
  padding: 0;

  li {
    display: flex;

    a {
      width: 100%;
    }
  }
`;

// tslint:disable-next-line:variable-name
const StyledEditIcon = styled(EditIcon)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

// tslint:disable-next-line:variable-name
const StyledTrashAltIcon = styled(TrashAltIcon)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

// tslint:disable-next-line: variable-name
const StyledLinkIcon = styled(LinkIcon)`
  width: 15px;
  height: 15px;
  margin-right: 10px;
  color: ${theme.color.text.default};
`;

// tslint:disable-next-line:variable-name
const HighlightToggleEditContent = styled.div`
  z-index: 2;
  border: 1px solid ${theme.color.neutral.formBorder};
  background-color: ${theme.color.neutral.formBackground};
`;

interface ContextMenuProps {
  highlight: Highlight;
  onDelete: () => void;
  onEdit: () => void;
  onColorChange: (color: HighlightColorEnum) => void;
}

// tslint:disable-next-line:variable-name
const ContextMenu = ({
  highlight: {
    id,
    color,
    annotation: hasAnnotation,
    sourceId,
  },
  onColorChange,
  onEdit,
  onDelete,
}: ContextMenuProps) => {
  const book = useSelector(bookSelector);

  const page = React.useMemo(() => book
    ? findArchiveTreeNode(book.tree, sourceId)
    : null
  , [book, sourceId]);

  const linkToHighlight = React.useMemo(() => {
    return `${page && book ? getBookPageUrlAndParams(book, page).url : ''}?highlight=${id}`;
  }, [id, page, book]);

  return <StyledContextMenu>
    <Dropdown
      toggle={<MenuToggle/>}
      transparentTab={false}
    >
      <HighlightToggleEditContent>
        <ColorPicker
          color={color}
          size='small'
          onChange={onColorChange}
        />
        <StyledDropdownList>
          <DropdownItem
            data-testid='edit'
            message={hasAnnotation ? 'i18n:highlighting:dropdown:edit' : 'i18n:highlighting:dropdown:add-note'}
            prefix={<StyledEditIcon/>}
            onClick={() => onEdit()}
          />
          <DropdownItem
            data-testid='delete'
            message='i18n:highlighting:dropdown:delete'
            prefix={<StyledTrashAltIcon/>}
            onClick={() => onDelete()}
          />
          <DropdownItem
            data-testid='goto-highlight'
            message='i18n:highlighting:dropdown:goto-highlight'
            prefix={<StyledLinkIcon/>}
            href={linkToHighlight}
            target='_blank'
          />
        </StyledDropdownList>
      </HighlightToggleEditContent>
    </Dropdown>
  </StyledContextMenu>;
};

export default ContextMenu;
