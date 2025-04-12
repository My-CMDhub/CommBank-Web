import React, { memo, useState, useEffect } from 'react'
import 'emoji-mart/css/emoji-mart.css'
import { Picker, PickerProps } from 'emoji-mart'
import styled from 'styled-components'

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  style?: React.CSSProperties
}

// Using memo to prevent unnecessary re-renders
const EmojiPicker = memo(({ onSelect, style }: EmojiPickerProps) => {
  const [mounted, setMounted] = useState(false);

  // Delay mounting the emoji picker to improve initial render performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <LoadingContainer style={style}>Loading emoji picker...</LoadingContainer>;
  }

  // Custom categories to reduce the number of emojis displayed
  // Using proper type for emoji-mart categories
  const include: PickerProps["include"] = ['people', 'nature', 'foods', 'activity', 'objects', 'symbols'];

  return (
    <EmojiPickerContainer style={style}>
      <Picker
        set="apple"
        onSelect={(emoji: any) => onSelect(emoji.native)}
        title="Pick an emoji"
        emoji="point_up"
        enableFrequentEmojiSort
        theme="light"
        include={include}
        perLine={6}
        // Limit the number of results to improve performance
        showPreview={false}
        showSkinTones={false}
        emojiSize={20}
      />
    </EmojiPickerContainer>
  )
});

const EmojiPickerContainer = styled.div`
  position: absolute;
  z-index: 100;
`

const LoadingContainer = styled.div`
  position: absolute;
  z-index: 100;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.2);
  text-align: center;
  min-width: 200px;
`

export default EmojiPicker;
