'use client';

import { useEffect, useState } from 'react';
import { MultiSelect, Container, Title, TextInput,
        Card, Text, Group, Badge, Stack, Modal, Button } from '@mantine/core';
import { PillsInput, Pill, Combobox, CheckIcon, useCombobox } from '@mantine/core';
import { SimpleGrid } from "@mantine/core";
import { useDisclosure } from '@mantine/hooks';
import UploadMapresModal from "./uploadmodal";
import MapresModal from "./mapresmodal";


import { getMapres, getImageURL } from './api';
import { Mapres } from './mapres';

import TagSearcher from './tagsearcher';


export default function Page() {
  const [mapresList, setMapresList] = useState<Mapres[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [uploadOpened, { open: openUpload, close: closeUpload }] = useDisclosure(false);
  const [mapresOpened, { open: openMapres, close: closeMapres }] = useDisclosure(false);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedMapres, setSelectedMapres] = useState<Mapres | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('grey_checkerboard');


  // fetch available tags on mount
  useEffect(() => {
    getMapres()
      .then(data => {
        setMapresList(Object.values(data) as Mapres[]);
        // data is an object: { [name]: Mapres }
        const allTags = new Set<string>();
        (Object.values(data) as Mapres[]).forEach((mapres: Mapres) => {
          mapres.tags.forEach((tag: string) => allTags.add(tag));
        });
        setAvailableTags(Array.from(allTags).sort());
      })
      .catch(err => {
        console.error("Failed to fetch mapres:", err);
      });
  }, []);

  return (
    <Container size="xl" py="md">
      <Title height={60}>
          teeDB
      </Title>
      <Text>
        the simplest mapres db for Teeworlds{' '}
        <span
          onClick={openUpload}
          style={{
        color: '#228be6',
        cursor: 'pointer',
        transition: 'color 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.color = '#1864ab')}
          onMouseOut={e => (e.currentTarget.style.color = '#228be6')}
        >
          (upload)
        </span>
      </Text>

      <UploadMapresModal opened={uploadOpened} onClose={closeUpload} onSuccess={() => alert("Uploaded!")} />
      <MapresModal
        opened={mapresOpened}
        onClose={() => {
          closeMapres();
          setSelectedMapres(null);
        }}
        mapres={selectedMapres}
        backgroundImage={backgroundImage}
      />

      <Stack gap="md" mt="md">
        
        <Group justify="space-between" align="center">
          <div style={{ flex: 1, marginRight: '16px' }}>
            <TagSearcher
              data={availableTags}
              value={tags}
              onChange={setTags}
              placeholder="Search for tags... (e.g. unhookable, quad, tileset, etc.)"
            />
          </div>
          
          <Group gap="xs">
            <Text size="sm" fw={500}></Text>
            <Button
              size="xs"
              variant="filled"
              onClick={() => setBackgroundImage('white_checkerboard')}
              style={{
                backgroundColor: 'white',
                color: 'black',
                border: backgroundImage === 'white_checkerboard' ? '3px solid orange' : '2px solid black',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                padding: 0,
                minWidth: '32px'
              }}
            />
            <Button
              size="xs"
              variant="filled"
              onClick={() => setBackgroundImage('grey_checkerboard')}
              style={{
                backgroundColor: '#888',
                color: 'white',
                border: backgroundImage === 'grey_checkerboard' ? '3px solid orange' : '2px solid black',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                padding: 0,
                minWidth: '32px'
              }}
            />
            <Button
              size="xs"
              variant="filled"
              onClick={() => setBackgroundImage('sky')}
              style={{
                backgroundColor: '#87CEEB',
                color: 'white',
                border: backgroundImage === 'sky' ? '3px solid orange' : '2px solid black',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                padding: 0,
                minWidth: '32px'
              }}
            />
          </Group>
        </Group>

        <SimpleGrid
          cols={4}
          spacing="md"
        >
          {mapresList
            .filter((mapres) =>
              tags.length === 0 || tags.every((tag) => mapres.tags.includes(tag))
            )
            .map((mapres) => (
              <Card
                key={mapres.name}
                shadow="sm"
                padding={0}
                radius="md"
                withBorder
                onClick={() => {
                  setSelectedMapres(mapres);
                  openMapres();
                }}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  backgroundImage: `url(/bgs/${backgroundImage}.png)`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              >
                <img
                  src={getImageURL(mapres.name)}
                  alt={mapres.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    background: 'rgba(255,255,255,0.95)',
                    padding: '6px 8px',
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: 14,
                    color: '#000',
                    boxShadow: '0 -1px 3px rgba(0,0,0,0.05)',
                  }}
                >
                  {mapres.name}
                </div>
              </Card>
            ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}