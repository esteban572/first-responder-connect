import { useState, useRef, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { searchUsersForMention } from '@/lib/commentService';
import { cn } from '@/lib/utils';

interface MentionUser {
  id: string;
  full_name: string;
  avatar_url?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  className,
  onKeyDown,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search for users when mention query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (mentionQuery.length > 0) {
        const results = await searchUsersForMention(mentionQuery);
        setSuggestions(results);
        setSelectedIndex(0);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounce = setTimeout(searchUsers, 150);
    return () => clearTimeout(debounce);
  }, [mentionQuery]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    onChange(newValue);

    // Check if we're in a mention context
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's a space or newline after @ (which would end the mention)
      if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
        setMentionQuery(textAfterAt);
        setMentionStart(lastAtIndex);
        return;
      }
    }

    // Not in a mention context
    setMentionQuery('');
    setMentionStart(-1);
    setShowSuggestions(false);
  }, [onChange]);

  const insertMention = useCallback((user: MentionUser) => {
    if (mentionStart === -1) return;

    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(mentionStart + mentionQuery.length + 1);

    // Format: @[Full Name](userId) - this allows parsing later
    const mentionText = `@[${user.full_name}](${user.id}) `;
    const newValue = beforeMention + mentionText + afterMention;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery('');
    setMentionStart(-1);

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + mentionText.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, mentionStart, mentionQuery, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % suggestions.length);
          return;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          return;
        case 'Enter':
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
          return;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          return;
        case 'Tab':
          e.preventDefault();
          insertMention(suggestions[selectedIndex]);
          return;
      }
    }

    // Pass through other key events
    onKeyDown?.(e);
  }, [showSuggestions, suggestions, selectedIndex, insertMention, onKeyDown]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn('min-h-[60px] resize-none', className)}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 bottom-full mb-1 left-0 w-full max-h-48 overflow-y-auto bg-popover border border-border rounded-md shadow-lg"
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted transition-colors',
                index === selectedIndex && 'bg-muted'
              )}
              onClick={() => insertMention(user)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="text-xs">
                  {user.full_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.full_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders comment content with clickable mentions
 */
export function renderCommentWithMentions(
  content: string,
  onUserClick: (userId: string) => void
): React.ReactNode {
  // Pattern: @[User Name](userId)
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    // Add the mention as a clickable link
    const userName = match[1];
    const userId = match[2];
    parts.push(
      <button
        key={`mention-${match.index}`}
        className="text-primary font-medium hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          onUserClick(userId);
        }}
      >
        @{userName}
      </button>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 0 ? parts : content;
}
