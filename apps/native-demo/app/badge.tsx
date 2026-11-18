import { heart } from '@joralvmel/cosmos-icons/heart';
import { Badge, type BadgeProps, Button, Switch, useTheme } from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { demoModes, demoThemes, useDemoSettings } from '../src/settings';

type Variant = NonNullable<BadgeProps['variant']>;
type Tone = NonNullable<BadgeProps['tone']>;
type Size = NonNullable<BadgeProps['size']>;

export default function BadgeScreen() {
  const theme = useTheme();
  const demoSettings = useDemoSettings();
  const [variant, setVariant] = useState<Variant>('soft');
  const [tone, setTone] = useState<Tone>('neutral');
  const [size, setSize] = useState<Size>('md');
  const [showIcon, setShowIcon] = useState(false);
  const [longText, setLongText] = useState(false);
  const [showCount, setShowCount] = useState(false);
  const [styleOverride, setStyleOverride] = useState(false);
  const groupStyle = { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space.xs } as const;
  const headingStyle = { color: theme.colors.fg, fontSize: theme.text.md } as const;
  const explanatoryStyle = { color: theme.colors['fg-muted'], fontSize: theme.text.sm } as const;
  const label = longText ? 'This deliberately long status label wraps without truncation' : 'Ready';
  const zero = '0';
  const dozen = '12';
  const four = '4';
  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Badge' }} />
      <Text style={headingStyle}>Static status and category labels</Text>
      <Text style={explanatoryStyle}>
        Badge does not announce changes; the application supplies context and announcements.
      </Text>

      <Badge
        testID="badge-preview"
        variant={variant}
        tone={tone}
        size={size}
        startIcon={showIcon ? heart : undefined}
        style={
          styleOverride
            ? {
                backgroundColor: theme.colors['info-subtle'],
                borderColor: theme.colors['info-text'],
                borderRadius: theme.radius.full,
                paddingHorizontal: theme.space.lg,
              }
            : undefined
        }
        textStyle={
          styleOverride
            ? { color: theme.colors['info-text'], fontWeight: theme.weight.bold }
            : undefined
        }
      >
        {showCount ? '0' : label}
      </Badge>

      <Text style={headingStyle}>Theme</Text>
      <View style={groupStyle}>
        {demoThemes.map(item => (
          <Button
            key={item}
            size="sm"
            variant={demoSettings.theme === item ? 'solid' : 'outline'}
            tone={demoSettings.theme === item ? 'primary' : 'neutral'}
            onPress={() => demoSettings.setTheme(item)}
          >
            {item}
          </Button>
        ))}
      </View>

      <Text style={headingStyle}>Mode</Text>
      <View style={groupStyle}>
        {demoModes.map(item => (
          <Button
            key={item}
            size="sm"
            variant={demoSettings.mode === item ? 'solid' : 'outline'}
            tone={demoSettings.mode === item ? 'primary' : 'neutral'}
            onPress={() => demoSettings.setMode(item)}
          >
            {item}
          </Button>
        ))}
      </View>

      <Text style={headingStyle}>Variant</Text>
      <View style={groupStyle}>
        {(['soft', 'solid', 'outline'] as const).map(item => (
          <Button
            key={item}
            size="sm"
            variant={variant === item ? 'solid' : 'outline'}
            tone={variant === item ? 'primary' : 'neutral'}
            onPress={() => setVariant(item)}
          >
            {item}
          </Button>
        ))}
      </View>

      <Text style={headingStyle}>Tone</Text>
      <View style={groupStyle}>
        {(['neutral', 'info', 'success', 'warning', 'danger'] as const).map(item => (
          <Button
            key={item}
            size="sm"
            variant={tone === item ? 'solid' : 'outline'}
            tone={tone === item ? 'primary' : 'neutral'}
            onPress={() => setTone(item)}
          >
            {item}
          </Button>
        ))}
      </View>

      <Text style={headingStyle}>Size</Text>
      <View style={groupStyle}>
        {(['sm', 'md', 'lg'] as const).map(item => (
          <Button
            key={item}
            size="sm"
            variant={size === item ? 'solid' : 'outline'}
            tone={size === item ? 'primary' : 'neutral'}
            onPress={() => setSize(item)}
          >
            {item}
          </Button>
        ))}
      </View>

      <Switch
        label="Show decorative heart icon"
        checked={showIcon}
        onCheckedChange={({ checked }) => setShowIcon(checked)}
      />
      <Switch
        label="Show long wrapping label"
        checked={longText}
        onCheckedChange={({ checked }) => setLongText(checked)}
      />
      <Switch
        label="Show caller-formatted zero count"
        checked={showCount}
        onCheckedChange={({ checked }) => setShowCount(checked)}
      />
      <Switch
        label="Apply container and text style overrides"
        checked={styleOverride}
        onCheckedChange={({ checked }) => setStyleOverride(checked)}
      />

      <Text style={headingStyle}>Count examples (text is supplied by the caller)</Text>
      <View style={groupStyle}>
        <Badge>{zero}</Badge>
        <Badge tone="success">{dozen}</Badge>
        <Badge variant="outline" tone="warning">
          {four}
        </Badge>
      </View>
    </ScrollView>
  );
}
