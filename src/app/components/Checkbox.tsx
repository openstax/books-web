import React from 'react';
import styled from 'styled-components/macro';
import { Check } from 'styled-icons/fa-solid/Check';
import theme from '../theme';

// tslint:disable-next-line:variable-name
const CheckIcon = styled(Check)`
  color: ${theme.color.white};
  height: 1rem;
  width: 1rem;
  display: none;
`;

interface Props {
  className?: string;
  checked?: boolean;
}

// tslint:disable-next-line:variable-name
const CustomCheckbox = styled(
  ({className}: {className?: string}) => <span className={className}><CheckIcon /></span>
)`
  height: 1.6rem;
  width: 1.6rem;
  display: flex;
  justify-content: center;
  align-items: center;

  input:not(:checked) + & {
    border: 1px solid ${theme.color.primary.gray.darker};
  }
  input:checked + & {
    background-color: ${theme.color.primary.orange.darkest};
  }
  input:checked + & ${CheckIcon} {
    display: block;
  }
`;

// tslint:disable-next-line:variable-name
const Checkbox = ({children, className, ...props}: React.PropsWithChildren<Props>) => <label className={className}>
  <input type='checkbox' {...props} />
  <CustomCheckbox />
  {children}
</label>;

export default styled(Checkbox)`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
`;
