import styled from 'styled-components';

export const DeckStyled = styled.div`
  position: absolute;
  top: 7vw;
  right: 26vw;
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(20px);
    }
  }
`;
