import {
  Button,
  Dialog,
  type DialogHandle,
  type DialogSize,
  useTheme,
} from '@joralvmel/cosmos-native';
import { Stack } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { type Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const longDetails = [
  'Booking detail 1: the selected date and arrival time are reserved.',
  'Booking detail 2: two guests are included in this confirmation.',
  'Booking detail 3: changes can be made from the booking summary.',
  'Booking detail 4: the venue is accessible from the main entrance.',
  'Booking detail 5: dietary notes can be added before confirming.',
  'Booking detail 6: the confirmation is sent after the request succeeds.',
  'Booking detail 7: contact details are used only for this reservation.',
  'Booking detail 8: the booking remains editable until the cutoff.',
  'Booking detail 9: cancellation terms are shown in the summary.',
  'Booking detail 10: the total is reviewed before final submission.',
  'Booking detail 11: support is available if any detail is incorrect.',
  'Booking detail 12: the title, close control and actions stay visible.',
] as const;

export default function DialogScreen() {
  const theme = useTheme();
  const [controlledOpen, setControlledOpen] = useState(false);
  const [presentation, setPresentation] = useState<'standard' | 'fullscreen'>('standard');
  const [size, setSize] = useState<DialogSize>('md');
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
  const [fullWidth, setFullWidth] = useState(false);
  const [responsiveFullscreen, setResponsiveFullscreen] = useState(false);
  const [movable, setMovable] = useState(false);
  const [longContent, setLongContent] = useState(false);
  const [cancelClose, setCancelClose] = useState(false);
  const [closeOnBackdropPress, setCloseOnBackdropPress] = useState(false);
  const [closeOnAndroidBack, setCloseOnAndroidBack] = useState(true);
  const [lastChange, setLastChange] = useState('No requests yet');
  const [autonomousStatus, setAutonomousStatus] = useState('Closed');
  const controlledDialog = useRef<DialogHandle | null>(null);
  const autonomousDialog = useRef<DialogHandle | null>(null);
  const openerRef = useRef<ComponentRef<typeof Pressable> | null>(null);
  const inputRef = useRef<ComponentRef<typeof TextInput> | null>(null);
  const [name, setName] = useState('');
  const label = { color: theme.colors.fg, fontSize: theme.text.md };
  const muted = { color: theme.colors['fg-muted'], fontSize: theme.text.sm };
  const controlRow = {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.space.sm,
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.space.lg, gap: theme.space.lg }}>
      <Stack.Screen options={{ title: 'Dialog' }} />
      <Text
        style={{
          color: theme.colors.fg,
          fontSize: theme.text.xl,
          fontWeight: theme.weight.bold,
        }}
      >
        Controlled dialog
      </Text>
      <Text style={muted}>
        Exercise modal ownership, close vetoes, native Back, focus restoration, safe areas and
        scrolling content.
      </Text>
      <Text style={muted}>
        Native callers should pass returnFocusTarget explicitly; React Native does not expose the
        currently focused invoker for automatic restoration.
      </Text>
      <View style={controlRow}>
        <Button
          ref={openerRef}
          variant="solid"
          onPress={() => controlledDialog.current?.requestOpen()}
        >
          Open controlled dialog
        </Button>
        <Button
          variant="soft"
          onPress={() =>
            setPresentation(value => (value === 'standard' ? 'fullscreen' : 'standard'))
          }
        >
          {`Presentation: ${presentation}`}
        </Button>
        <Button
          variant="soft"
          onPress={() => setSize(value => (value === 'sm' ? 'md' : value === 'md' ? 'lg' : 'sm'))}
        >
          {`Size: ${size}`}
        </Button>
        <Button
          variant="soft"
          onPress={() => setMaxWidth(value => (value === undefined ? 420 : undefined))}
        >
          {`Max width: ${maxWidth ?? 'size default'}`}
        </Button>
        <Button variant="soft" onPress={() => setFullWidth(value => !value)}>
          {`Full width: ${fullWidth ? 'on' : 'off'}`}
        </Button>
        <Button variant="soft" onPress={() => setResponsiveFullscreen(value => !value)}>
          {`Responsive fullscreen: ${responsiveFullscreen ? 'on' : 'off'}`}
        </Button>
        <Button variant="soft" onPress={() => setMovable(value => !value)}>
          {`Movable: ${movable ? 'on' : 'off'}`}
        </Button>
        <Button variant="soft" onPress={() => setLongContent(value => !value)}>
          {longContent ? 'Use short body' : 'Use long body'}
        </Button>
        <Button variant="soft" onPress={() => setCancelClose(value => !value)}>
          {`Close veto: ${cancelClose ? 'on' : 'off'}`}
        </Button>
        <Button variant="soft" onPress={() => setCloseOnBackdropPress(value => !value)}>
          {`Backdrop close: ${closeOnBackdropPress ? 'on' : 'off'}`}
        </Button>
        <Button variant="soft" onPress={() => setCloseOnAndroidBack(value => !value)}>
          {`Android Back: ${closeOnAndroidBack ? 'on' : 'off'}`}
        </Button>
      </View>
      <Text style={muted}>
        Visibility: {controlledOpen ? 'open' : 'closed'} · Last request: {lastChange}
      </Text>

      <Dialog
        ref={controlledDialog}
        open={controlledOpen}
        presentation={presentation}
        size={size}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        responsiveFullscreen={responsiveFullscreen}
        movable={movable}
        moveControlsLabel="Mover diálogo"
        moveUpLabel="Mover arriba"
        moveDownLabel="Mover abajo"
        moveLeftLabel="Mover a la izquierda"
        moveRightLabel="Mover a la derecha"
        moveCenterLabel="Centrar diálogo"
        closeLabel="Cerrar diálogo"
        closeOnBackdropPress={closeOnBackdropPress}
        closeOnAndroidBack={closeOnAndroidBack}
        initialFocusTarget={inputRef}
        returnFocusTarget={openerRef}
        title={
          <Text
            style={{
              color: theme.colors.fg,
              fontSize: theme.text.lg,
              fontWeight: theme.weight.semibold,
            }}
          >
            Booking confirmation
          </Text>
        }
        description="Check the details and enter a name before confirming."
        onOpenChange={detail => {
          if (detail.open === false && cancelClose) {
            detail.preventDefault();
            setLastChange(`${detail.reason} (canceled)`);
            return;
          }
          setLastChange(detail.open ? 'open (action)' : `closed (${detail.reason})`);
          setControlledOpen(detail.open);
        }}
        actions={
          <View style={controlRow}>
            {cancelClose ? (
              <Button variant="outline" onPress={() => setCancelClose(false)}>
                Allow close requests
              </Button>
            ) : null}
            <Button variant="soft" onPress={() => controlledDialog.current?.requestClose()}>
              Cancel
            </Button>
            <Button variant="solid" onPress={() => controlledDialog.current?.requestClose()}>
              Confirm
            </Button>
          </View>
        }
      >
        <TextInput
          ref={inputRef}
          accessibilityLabel="Name for the booking"
          placeholder="Your name"
          placeholderTextColor={theme.colors['fg-muted']}
          value={name}
          onChangeText={setName}
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: theme.colors['border-strong'],
            borderRadius: theme.radius.md,
            color: theme.colors.fg,
            fontSize: theme.text.md,
            paddingHorizontal: theme.space.md,
          }}
        />
        {longContent ? (
          longDetails.map(detail => (
            <Text key={detail} style={[label, { marginTop: theme.space.md }]}>
              {detail}
            </Text>
          ))
        ) : (
          <Text style={[label, { marginTop: theme.space.md }]}>
            Two guests · Saturday at 7:00 PM
          </Text>
        )}
      </Dialog>

      <Text
        style={{
          color: theme.colors.fg,
          fontSize: theme.text.lg,
          fontWeight: theme.weight.semibold,
        }}
      >
        Autonomous dialog
      </Text>
      <Text style={muted}>
        This instance omits the controlled open prop; the component owns state after each accepted
        request.
      </Text>
      <View style={controlRow}>
        <Button variant="outline" onPress={() => autonomousDialog.current?.requestOpen()}>
          Open autonomous dialog
        </Button>
        <Text style={[label, { alignSelf: 'center' }]}>{autonomousStatus}</Text>
      </View>
      <Dialog
        ref={autonomousDialog}
        defaultOpen={false}
        title="Saved locally"
        description="This dialog uses autonomous visibility."
        closeLabel="Cerrar"
        onOpenChange={detail =>
          setAutonomousStatus(detail.open ? 'Open' : `Closed (${detail.reason})`)
        }
        actions={
          <Button variant="solid" onPress={() => autonomousDialog.current?.requestClose()}>
            Done
          </Button>
        }
      >
        <Text style={label}>Use the close icon, Done, Android Back, or the open control.</Text>
      </Dialog>
    </ScrollView>
  );
}
