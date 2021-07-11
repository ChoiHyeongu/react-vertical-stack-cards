import React, { useState, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { useSprings, animated } from '@react-spring/web'
import { useDrag } from 'react-use-gesture'
import {
  Image1, Image2, Image3, Image4, Image5
} from './assets';

const deviceHeight = 812;
const deviceWidth = 375;

const MAX_SCALE = 1;
const MIN_SCALE = 0.9;

const dummy = [
  { image: Image1, title: 'This is title', description: 'This is description' },
  { image: Image2, title: 'This is title', description: 'This is description' },
  { image: Image3, title: 'This is title', description: 'This is description' },
  { image: Image4, title: 'This is title', description: 'This is description' },
  { image: Image5, title: 'This is title', description: 'This is description' }
];

const CardStackList = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRef = useRef();
  const [cardHeight, setCardHeight] = useState(0);
  const [props, animationApi] = useSprings(dummy.length, (i) => ({ y: 0, scale: i !== 0 ? MIN_SCALE : MAX_SCALE }))

  useEffect(() => {
    prepareCardHeight();
  }, [])

  const prepareCardHeight = () => {
    if (cardRef.current) {
      setCardHeight(cardRef.current?.clientHeight);
    }
  }

  const lerp = (x, y, a) => x * (1 - a) + y * a;
  const invlerp = (x, y, a) => clamp((a - x) / (y - x));
  const clamp = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
  const range = (
    x1,
    y1,
    x2,
    y2,
    a
  ) => lerp(x2, y2, invlerp(x1, y1, a));


  const increaseScale = (y, index) => {
    if (!index || index === currentIndex + 1) {
      const result = range(0, cardHeight, MIN_SCALE, MAX_SCALE, Math.abs(y));
      return result
    }

    return MIN_SCALE;
  }

  const decreaseScale = (y) => {
    const result = range(0, cardHeight, 1, MIN_SCALE, Math.abs(y));
    return result
  }

  const bind = useDrag(({ args: [index], down, movement: [mvX, mvY], velocity, offset: [offX, offY], cancel }) => {
    const trigger = velocity >= 0.2;
    const positionY = -cardHeight * (currentIndex)

    animationApi.start((i) => {
      if (i === currentIndex) {
        if (mvY >= 0) {
          if (trigger && !down && currentIndex > 0) {
            setCurrentIndex(index - 1);
            return { y: -cardHeight * (currentIndex - 1), scale: down ? decreaseScale(cardHeight) : MIN_SCALE };
          }
          return { y: down ? -cardHeight * currentIndex + mvY : positionY, scale: down ? decreaseScale(mvY) : MAX_SCALE }
        }

        if (mvY < 0) {
          if (trigger && !down && index + 1 < dummy.length) {
            return { scale: down ? decreaseScale(cardHeight) : MIN_SCALE }
          }
          return { scale: down ? decreaseScale(mvY) : MAX_SCALE }
        }
      }

      if (i < currentIndex) {
        if (mvY >= 0) {
          if (trigger && !down) {
            return { scale: down ? increaseScale(cardHeight, i) : MAX_SCALE }
          }
          return { scale: down ? increaseScale(mvY) : MIN_SCALE }
        }
      }

      if (i > currentIndex) {
        if (mvY < 0) {
          if (trigger && !down) {
            const isNext = i === currentIndex + 1;
            setCurrentIndex(index + 1);
            return { y: -cardHeight * (currentIndex + 1), scale: down ? increaseScale(cardHeight, i) : isNext ? 1 : MIN_SCALE };
          }
          return { y: down ? positionY + mvY : positionY, scale: down ? increaseScale(mvY, i) : MIN_SCALE }
        }

        if (mvY >= 0) {
          if (trigger && !down && currentIndex > 0) {
            return { y: -cardHeight * (currentIndex - 1) };
          }
          return { y: down ? -cardHeight * currentIndex + mvY : positionY, scale: down ? increaseScale(mvY, i) : MIN_SCALE }
        }
      }
    })
  }, {
    bounds: { top: -cardHeight * 0.9 },
    rubberband: true,
  })

  return (
    <Container>
      <CardList>
        {props.map(({ scale, y }, index) => <Card
          cardRef={cardRef}
          index={index}
          y={y}
          scale={scale}
          bind={bind}
          item={dummy[index]}
          showShadow={currentIndex - 1 <= index || index <= currentIndex + 1} />)}
      </CardList>
    </Container>
  )
}

const Card = (props) => {
  const { item, cardRef, index, y, scale, bind, showShadow } = props;

  return (
    <animated.div ref={cardRef} {...bind(index)} style={{ y, scale }}>
      <StyledCard deviceWidth={deviceWidth} showShadow={showShadow}>
        <img src={item.image} className={'--banner'} />
        <div className={'--info'}>
          <div className={'--title'}>
            {item.title}
          </div>
          <div className={'--description'}>
            {item.description}
          </div>
        </div>
      </StyledCard>
    </animated.div>
  )
};

const Container = styled.div`
  display: flex;
  flex:1;
  padding: 42px 24px 0px 24px;
  overflow-y: hidden;
  height: 100%;
`;

const CardList = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  
`

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #FFFFFF;
  ${({ showShadow }) => showShadow && css`
    box-shadow: 0px 4px 24px rgba(0, 0, 0, 0.08);
  `}
  border-radius: 20px;
  overflow: hidden;

  .--info {
    display: flex;
    flex-direction: column;
    padding-top: 8px;
    padding: 8px 16px 20px 16px;
  }

  .--banner {
    width: ${({ deviceWidth }) => `${deviceWidth - 24}px`};
    height: ${({ deviceWidth }) => `${deviceWidth - 24}px`};
    object-fit: cover;
  }

  .--title {
    padding: 16px 0 8px 0;
    font-size: 32px;
    line-height: 42px;
    letter-spacing: -0.2px;
    font-weight: 700;
  }

  .--description {
    font-size: 20px;
    line-height: 26px;
    letter-spacing: -0.08px;
  }
`

export default CardStackList;