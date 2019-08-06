import styled from 'styled-components/macro';

export default styled.a`
  /* Hide the link when it is not focused */
  clip: rect(1px, 1px, 1px, 1px);
  margin: 0;
  position: absolute;
  left: 0;
  top: 0;
  height: 1px;
  width: 1px;
  overflow: hidden;
  text-decoration: none;

  /* Show the link when it is focused */
  :focus {
    clip: auto;
    height: auto;
    width: auto;
    z-index: 20;
  }
`;
