import styled from 'styled-components';

export const Section = styled('div')<any>`
  width: calc(100% - 64px);
  min-height: calc(100vh - 192px);
  padding: 96px 0;
  display: flex;
  align-items: center;

  @media only screen and (max-width: 768px) {
    height: auto;
    padding-top: 150px;
  }

  @media only screen and (max-width: 450px) {
    width:auto;
    padding: 128px 0 32px 0;
  }
`
export const Container = styled('div')<any>`
  width: 100%;
  height: 100%;
  max-width: 1280px;
  margin-right: auto;
  margin-left: auto;
  padding: 0 32px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 96px;
  
  @media only screen and (max-width: 1024px) {
    gap: 48px;
  }

  @media only screen and (max-width: 768px) {
    flex-direction: column;
  }

  @media only screen and (max-width: 450px) {
    padding: 0 16px;
    width: auto;
  }
`;
export const Column = styled('div')<any>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 64px;
  width: 100%;
  height: 100%;

  @media only screen and (max-width: 450px) {
    gap: 32px;
  }
`;
export const MintCount = styled('h3')`
  font-family: 'Plus Jakarta Sans';
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 100%;
  text-transform: uppercase;
  color: var(--white);
`;
