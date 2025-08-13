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
import { getImageURL, getExampleURL, getRulesURL, getVariantURL, getAPIKey, checkAuth, deleteMapres } from "./api";
import { Mapres } from "./mapres";
import { IconDownload } from "@tabler/icons-react";

type MapresModalProps = {
  opened: boolean;
  onClose: () => void;
  mapres: Mapres | null;
  backgroundImage?: string;
};

export default function MapresModal({
  opened,
  onClose,
  mapres,
  backgroundImage = 'grey_checkerboard',
}: MapresModalProps) {
  if (!mapres) return null;

  const imageURL = getImageURL(mapres.name);
  const exampleURL = getExampleURL(mapres.name);
  const rulesURL = getRulesURL(mapres.name);

  const hasExample = mapres.example_path;
  const hasRules = mapres.automapper_path;
  const hasVariants = mapres.variant_paths && mapres.variant_paths.length > 0;
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
          <Stack style={{ flex: 1 }}>
            <Box
              style={{
                  backgroundImage: `url(/bgs/${backgroundImage}.png)`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  borderRadius: 6,
                  cursor: 'pointer'
              }}
              onClick={() => downloadFile(imageURL, `${mapres.name}.png`)}
              >
              <Image
                  src={imageURL}
                  alt="Main image"
                  radius="sm"
                  style={{ width: '100%', objectFit: 'contain', background: 'transparent' }}
              />
            </Box>
          </Stack>

          <Stack style={{ flex: 1 }}>
            {hasExample ? (
              <Box
                style={{
                  cursor: 'pointer'
                }}
                onClick={() => downloadFile(exampleURL, `${mapres.name}_example.png`)}
              >
                <Image
                  src={exampleURL}
                  alt="Example image"
                  radius="sm"
                  style={{ width: '100%', objectFit: 'contain' }}
                />
              </Box>
            ) : (
              <Center h="100%" mih={300}>
                <Text c="dimmed" ta="center">
                  No example image available.
                </Text>
              </Center>
            )}
          </Stack>
        </Group>
        <Stack gap="xs">
          {hasVariants && (
              <>
                <Text size="sm" fw={500}>Variants</Text>
                <Group gap="xs">
                  {mapres.variant_paths?.map((_, index) => (
                    <Box
                      key={index}
                      style={{
                        backgroundImage: `url(/bgs/${backgroundImage}.png)`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        borderRadius: 4,
                        cursor: 'pointer',
                        height: '150px',
                        display: 'inline-block'
                      }}
                      onClick={() => downloadFile(getVariantURL(mapres.name, index + 1), `${mapres.name}_variant_${index + 1}.png`)}
                    >
                      <Image
                        src={getVariantURL(mapres.name, index + 1)}
                        alt={`Variant ${index + 1}`}
                        radius="sm"
                        style={{ height: '150px', objectFit: 'contain', background: 'transparent' }}
                      />
                    </Box>
                  ))}
                </Group>
              </>
            )}
        </Stack>

        <Stack gap="xs">
        <Text size="sm">
            Tags:
        </Text>
          <Group gap="xs">
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
            onClick={() => downloadFile(imageURL, `${mapres.name}.png`)}
            variant="filled"
            leftSection={<IconDownload size={16} />}
          >
            Image
          </Button>
          <Button
            onClick={() => downloadFile(rulesURL, `${mapres.name}.rules`)}
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
