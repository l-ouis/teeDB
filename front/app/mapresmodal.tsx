"use client";

import {
  Modal,
  Image,
  Text,
  Stack,
  Group,
  Button,
  Badge,
  Divider,
  Box,
  Title,
  Center,
  Pill,
} from "@mantine/core";
import { getImageURL, getExampleURL, getRulesURL, getAPIKey, checkAuth, deleteMapres } from "./api";
import { Mapres } from "./mapres";
import { IconDownload } from "@tabler/icons-react";

type MapresModalProps = {
  opened: boolean;
  onClose: () => void;
  mapres: Mapres | null;
};

export default function MapresModal({
  opened,
  onClose,
  mapres,
}: MapresModalProps) {
  if (!mapres) return null;

  const imageURL = getImageURL(mapres.name);
  const exampleURL = getExampleURL(mapres.name);
  const rulesURL = getRulesURL(mapres.name);

  const hasExample = mapres.example_path;
  const hasRules = mapres.automapper_path;
  const deleteEnabled = checkAuth(getAPIKey());

    const downloadFile = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);

            if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(blobUrl);
        } catch (error: any) {
            alert(`Download error: ${error.message}`);
        }
    };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <>
          <Text fw={700}>
            {mapres.name}
          </Text>
          <Text size="sm" color="dimmed">
            {mapres.author}
          </Text>
        </>
      }
      size="xl"
      centered
      styles={{ body: { paddingTop: 12 }, content: { maxWidth: 900 } }}
    >
      <Stack>
        <Group align="flex-start" grow wrap="nowrap">
          <Box
            style={{
                flex: 1,
                backgroundColor: '#fff',
                backgroundImage: `
                linear-gradient(45deg, #ccc 25%, transparent 25%), 
                linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #ccc 75%), 
                linear-gradient(-45deg, transparent 75%, #ccc 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                borderRadius: 6,
            }}
            >
            <Image
                src={imageURL}
                alt="Main image"
                radius="sm"
                style={{ width: '100%', objectFit: 'contain', background: 'transparent' }}
            />
            </Box>


          <Box style={{ flex: 1 }}>
            {hasExample ? (
              <Image
                src={exampleURL}
                alt="Example image"
                radius="sm"
                style={{ width: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Center h="100%" mih={300}>
                <Text c="dimmed" ta="center">
                  No example image available.
                </Text>
              </Center>
            )}
          </Box>
        </Group>

        <Stack spacing="xs">
        <Text size="sm">
            Tags:
        </Text>
          <Group spacing="xs">
            {mapres.tags.map((tag) => (
              <Pill key={tag} size="md">
                {tag}
              </Pill>
            ))}
          </Group>
        </Stack>

        <Group justify="flex-end" mt="md">
            {deleteEnabled && (
                <Button
                variant="outline"
                color="red"
                onClick={() => {
                    if (confirm(`Are you sure you want to delete ${mapres.name}?`)) {
                        deleteMapres(mapres.name, getAPIKey())
                            .then(() => {
                                onClose();
                            })
                            .catch((error) => {
                                alert(`Error deleting mapres: ${error.message}`);
                            });
                    }
                }}
                >
                Delete
                </Button>
            )}
          <Button
            onClick={() => downloadFile(imageURL, `${mapres.name}`)}
            variant="filled"
            leftSection={<IconDownload size={16} />}
          >
            Image
          </Button>
          <Button
            onClick={() => downloadFile(rulesURL, `${mapres.name}`)}
            variant="outline"
            leftSection={<IconDownload size={16} />}
            disabled={!hasRules}
          >
            Automapper
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
