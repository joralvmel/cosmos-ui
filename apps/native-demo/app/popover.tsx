import { info } from '@joralvmel/cosmos-icons/info';
import {
  Icon,
  IconButton,
  Popover,
  type PopoverHandle,
  type PopoverOpenChangeDetail,
  usePopoverHost,
  useTheme,
} from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const sides = ['bottom', 'top', 'right', 'left'] as const;

export default function PopoverScreen() {
  const theme = useTheme();
  const { onScroll } = usePopoverHost();
  const closeRef = useRef<PopoverHandle>(null);
  const [controlledOpen, setControlledOpen] = useState(false);
  const [acceptClose, setAcceptClose] = useState(true);
  const [sideIndex, setSideIndex] = useState(0);
  const [outsideDismissal, setOutsideDismissal] = useState(true);
  const [escapeDismissal, setEscapeDismissal] = useState(true);
  const [customPanel, setCustomPanel] = useState(false);
  const [closable, setClosable] = useState(true);
  const [arrow, setArrow] = useState(true);
  const [hover, setHover] = useState(false);
  const [gap, setGap] = useState(8);
  const [lastProposal, setLastProposal] = useState('No proposal yet');
  const side = sides[sideIndex % sides.length];
  const textStyle = { color: theme.colors.fg, fontSize: theme.text.md };
  const controlStyle = {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.space.md,
    borderWidth: 1,
    borderColor: theme.colors['border-strong'],
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  } as const;
  const panelStyle = {
    maxWidth: customPanel ? 320 : 280,
    padding: customPanel ? theme.space.lg : theme.space.md,
    borderRadius: customPanel ? theme.radius.lg : theme.radius.md,
    borderWidth: customPanel ? 2 : 1,
  };

  const onOpenChange = (detail: PopoverOpenChangeDetail) => {
    setLastProposal(`${detail.open ? 'Open' : 'Close'} requested: ${detail.reason}`);
    if (!detail.open && !acceptClose) {
      detail.preventDefault();
      return;
    }
    setControlledOpen(detail.open);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      <Stack.Screen options={{ title: 'Popover' }} />
      <Text style={textStyle}>
        Non-modal anchored content. Outside presses keep their normal interaction; Android Back
        requests closure.
      </Text>
      <View style={{ gap: theme.space.sm }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: outsideDismissal }}
          onPress={() => setOutsideDismissal(value => !value)}
          style={controlStyle}
        >
          <Text style={textStyle}>Outside dismissal: {outsideDismissal ? 'on' : 'off'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: escapeDismissal }}
          onPress={() => setEscapeDismissal(value => !value)}
          style={controlStyle}
        >
          <Text style={textStyle}>Web Escape dismissal: {escapeDismissal ? 'on' : 'off'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: customPanel }}
          onPress={() => setCustomPanel(value => !value)}
          style={controlStyle}
        >
          <Text style={textStyle}>Panel style: {customPanel ? 'roomy outlined' : 'default'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: closable }}
          onPress={() => setClosable(value => !value)}
          style={controlStyle}
        >
          <Text style={textStyle}>Close button: {closable ? 'on' : 'off'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: arrow }}
          onPress={() => setArrow(value => !value)}
          style={controlStyle}
        >
          <Text style={textStyle}>Arrow: {arrow ? 'on' : 'off'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: hover }}
          onPress={() => setHover(value => !value)}
          style={controlStyle}
        >
          <Text style={textStyle}>Trigger: {hover ? 'hover / focus (web)' : 'press'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setGap(value => (value === 0 ? 8 : value === 8 ? 48 : 0))}
          style={controlStyle}
        >
          <Text style={textStyle}>Gap: {gap}</Text>
        </Pressable>
      </View>

      <View style={{ gap: theme.space.sm }}>
        <Text style={textStyle}>Autonomous visibility · side: {side}</Text>
        <Popover
          trigger={props => (
            <IconButton {...props} label="Open placement example">
              <Icon icon={info} />
            </IconButton>
          )}
          closable={closable}
          arrow={arrow}
          triggerMode={hover ? 'hover' : 'press'}
          gap={gap}
          side={side}
          align="start"
          closeOnOutsidePress={outsideDismissal}
          closeOnEscape={escapeDismissal}
          panelStyle={panelStyle}
          panelTestID="popover-demo-panel"
        >
          <View style={{ gap: theme.space.md }}>
            <Text style={textStyle}>
              This panel flips and shifts against the safe-area bounds. Scroll this screen to check
              that the anchored placement follows its trigger.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSideIndex(index => index + 1)}
              style={controlStyle}
            >
              <Text style={textStyle}>Change requested side</Text>
            </Pressable>
          </View>
        </Popover>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSideIndex(index => index + 1)}
          style={controlStyle}
        >
          <Text style={textStyle}>Next placement side</Text>
        </Pressable>
      </View>

      <View style={{ gap: theme.space.sm }}>
        <Text style={textStyle}>Controlled visibility · cancelable close proposals</Text>
        <Popover
          open={controlledOpen}
          onOpenChange={onOpenChange}
          trigger={props => (
            <IconButton {...props} label="Open controlled panel">
              <Icon icon={info} />
            </IconButton>
          )}
          closable={closable}
          arrow={arrow}
          triggerMode={hover ? 'hover' : 'press'}
          gap={gap}
          ref={closeRef}
          initialFocus
          closeOnOutsidePress={outsideDismissal}
          closeOnEscape={escapeDismissal}
          panelStyle={panelStyle}
          panelTestID="controlled-popover-panel"
        >
          <View style={{ gap: theme.space.md }}>
            <Text style={textStyle}>The owner decides whether to accept close requests.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => closeRef.current?.requestClose()}
              style={controlStyle}
            >
              <Text style={textStyle}>Request close from panel action</Text>
            </Pressable>
          </View>
        </Popover>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ selected: acceptClose }}
          onPress={() => setAcceptClose(value => !value)}
          style={controlStyle}
        >
          <Text style={textStyle}>{acceptClose ? 'Accept closes' : 'Cancel closes'}</Text>
        </Pressable>
        <Text style={textStyle}>{lastProposal}</Text>
      </View>
    </ScrollView>
  );
}
