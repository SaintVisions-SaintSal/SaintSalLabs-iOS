import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Dimensions,
  Modal,
  Share,
} from 'react-native';
import { C } from '../../config/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_ITEM_SIZE = (SCREEN_WIDTH - 32 - 24) / 3;

const SUPABASE_URL = 'https://euxrlpuegeiggedqbkiv.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1eHJscHVlZ2VpZ2dlZHFia2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTM1MTYsImV4cCI6MjA4MTUyOTUxNn0.KpvXVTIDXeGOBOQOhdPopVbYYfjB-RgPSyJJY3IY474';
const OPENAI_API_KEY =
  '';
const REPLICATE_API_TOKEN = '';
const RUNWAY_API_KEY =
  '';

const MODELS = [
  {
    id: 'dalle3',
    label: 'DALL-E 3',
    provider: 'OpenAI',
    badge: 'GPT-4',
    color: '#10A37F',
    quality: 'Ultra',
  },
  {
    id: 'sdxl',
    label: 'Stable Diffusion',
    provider: 'Replicate',
    badge: 'SDXL',
    color: '#7C3AED',
    quality: 'High',
  },
  {
    id: 'flux',
    label: 'FLUX Pro',
    provider: 'Replicate',
    badge: 'FLUX',
    color: '#2563EB',
    quality: 'Pro',
  },
  {
    id: 'runway',
    label: 'Runway Gen-3',
    provider: 'Runway',
    badge: 'VIDEO',
    color: '#EC4899',
    quality: 'Video',
  },
];

const STYLE_PRESETS = [
  { id: 'photorealistic', label: 'Photorealistic', icon: '📷' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬' },
  { id: 'luxury', label: 'Luxury Dark', icon: '✨' },
  { id: 'abstract', label: 'Abstract', icon: '🎨' },
  { id: 'minimal', label: 'Minimal', icon: '⬜' },
  { id: 'futuristic', label: 'Futuristic', icon: '🚀' },
];

const SIZES = [
  { id: '1024x1024', label: '1:1', desc: 'Square' },
  { id: '1792x1024', label: '16:9', desc: 'Wide' },
  { id: '1024x1792', label: '9:16', desc: 'Portrait' },
];

export default function ImageHub({ navigation }) {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('dalle3');
  const [selectedStyle, setSelectedStyle] = useState('luxury');
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const [generating, setGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageGrid, setImageGrid] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [generationCount, setGenerationCount] = useState(0);

  const buildEnhancedPrompt = (basePrompt, style) => {
    const styleMap = {
      photorealistic: 'photorealistic, 8k uhd, professional photography, sharp focus',
      cinematic: 'cinematic shot, dramatic lighting, film grain, anamorphic lens',
      luxury: 'luxury dark aesthetic, gold accents, premium quality, elegant, high-end',
      abstract: 'abstract art, vibrant colors, artistic, creative, expressive',
      minimal: 'minimalist design, clean, simple, white space, refined',
      futuristic: 'futuristic, sci-fi, neon lights, technology, advanced civilization',
    };
    return `${basePrompt}. ${styleMap[style] || styleMap.luxury}`;
  };

  const generateWithDALLE = async (enhancedPrompt) => {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: selectedSize,
        quality: 'hd',
        style: 'vivid',
      }),
    });
    const data = await res.json();
    if (data?.error) throw new Error(data.error.message);
    return data?.data?.[0]?.url || null;
  };

  const generateWithSDXL = async (enhancedPrompt) => {
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt: enhancedPrompt,
          negative_prompt: 'blurry, low quality, distorted, ugly',
          width: 1024,
          height: 1024,
          num_outputs: 1,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
      }),
    });
    const prediction = await res.json();
    if (prediction?.error) throw new Error(prediction.error);

    // Poll for result
    let pollRes = prediction;
    let attempts = 0;
    while (pollRes.status !== 'succeeded' && pollRes.status !== 'failed' && attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${pollRes.id}`, {
        headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
      });
      pollRes = await poll.json();
      attempts++;
    }
    if (pollRes.status === 'succeeded' && pollRes.output?.length > 0) {
      return pollRes.output[0];
    }
    throw new Error('Generation failed or timed out');
  };

  const generateWithFLUX = async (enhancedPrompt) => {
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'black-forest-labs/flux-pro',
        input: {
          prompt: enhancedPrompt,
          width: 1024,
          height: 1024,
          steps: 25,
          guidance: 3.5,
          output_format: 'webp',
          output_quality: 95,
        },
      }),
    });
    const prediction = await res.json();
    if (prediction?.error) throw new Error(prediction.error);

    let pollRes = prediction;
    let attempts = 0;
    while (pollRes.status !== 'succeeded' && pollRes.status !== 'failed' && attempts < 30) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${pollRes.id}`, {
        headers: { Authorization: `Token ${REPLICATE_API_TOKEN}` },
      });
      pollRes = await poll.json();
      attempts++;
    }
    if (pollRes.status === 'succeeded' && pollRes.output) {
      return Array.isArray(pollRes.output) ? pollRes.output[0] : pollRes.output;
    }
    throw new Error('FLUX generation failed');
  };

  const generateWithRunway = async (enhancedPrompt) => {
    // Runway text-to-image then to video
    const res = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Runway-Version': '2024-11-06',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        promptText: enhancedPrompt,
        duration: 5,
        ratio: '1280:768',
      }),
    });
    const data = await res.json();
    if (data?.error || !data?.id) {
      // Fallback to DALL-E for preview
      return generateWithDALLE(enhancedPrompt);
    }

    let taskRes = data;
    let attempts = 0;
    while (taskRes.status !== 'SUCCEEDED' && taskRes.status !== 'FAILED' && attempts < 20) {
      await new Promise((r) => setTimeout(r, 3000));
      const poll = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskRes.id}`, {
        headers: {
          Authorization: `Bearer ${RUNWAY_API_KEY}`,
          'X-Runway-Version': '2024-11-06',
        },
      });
      taskRes = await poll.json();
      attempts++;
    }
    if (taskRes.status === 'SUCCEEDED' && taskRes.output?.[0]) {
      return taskRes.output[0];
    }
    return generateWithDALLE(enhancedPrompt);
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      Alert.alert('Prompt Required', 'Enter a description to generate your image.');
      return;
    }
    setGenerating(true);
    setCurrentImage(null);
    try {
      const enhancedPrompt = buildEnhancedPrompt(prompt, selectedStyle);
      let imageUrl = null;

      if (selectedModel === 'dalle3') {
        imageUrl = await generateWithDALLE(enhancedPrompt);
      } else if (selectedModel === 'sdxl') {
        imageUrl = await generateWithSDXL(enhancedPrompt);
      } else if (selectedModel === 'flux') {
        imageUrl = await generateWithFLUX(enhancedPrompt);
      } else if (selectedModel === 'runway') {
        imageUrl = await generateWithRunway(enhancedPrompt);
      }

      if (imageUrl) {
        const newItem = {
          id: `gen_${Date.now()}`,
          url: imageUrl,
          prompt,
          model: selectedModel,
          style: selectedStyle,
          createdAt: new Date().toISOString(),
        };
        setCurrentImage(newItem);
        setImageGrid((prev) => [newItem, ...prev]);
        setGenerationCount((c) => c + 1);
      } else {
        Alert.alert('Generation Failed', 'No image was returned. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Image generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [prompt, selectedModel, selectedStyle, selectedSize]);

  const saveImage = async (item) => {
    setSaving(true);
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/generated_images`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: item.url,
          prompt: item.prompt,
          model: item.model,
          style: item.style,
          created_at: item.createdAt,
        }),
      });
      setSavedIds((prev) => [...prev, item.id]);
      Alert.alert('Saved', 'Image saved to your gallery.');
    } catch {
      Alert.alert('Error', 'Failed to save image.');
    } finally {
      setSaving(false);
    }
  };

  const shareImage = async (item) => {
    try {
      await Share.share({
        message: `Check out this AI-generated image from SaintSal Labs!\n\nPrompt: "${item.prompt}"\n\n${item.url}`,
        url: item.url,
      });
    } catch {}
  };

  const modelData = MODELS.find((m) => m.id === selectedModel);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SS</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Image Hub</Text>
            <Text style={styles.headerSubtitle}>AI VISUAL INTELLIGENCE</Text>
          </View>
        </View>
        <View style={styles.headerStats}>
          <Text style={styles.headerStatValue}>{generationCount}</Text>
          <Text style={styles.headerStatLabel}>Generated</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Prompt Input */}
        <View style={styles.promptSection}>
          <Text style={styles.sectionLabel}>GENERATE IMAGE</Text>
          <View style={styles.promptContainer}>
            <TextInput
              style={styles.promptInput}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Describe your vision in detail..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.promptSendBtn}
              onPress={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color={C.gold} size="small" />
              ) : (
                <Text style={styles.promptSendIcon}>↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Model Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MODEL</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.modelRow}>
              {MODELS.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[styles.modelCard, selectedModel === model.id && styles.modelCardActive]}
                  onPress={() => setSelectedModel(model.id)}
                >
                  <View style={[styles.modelBadge, { backgroundColor: model.color + '30' }]}>
                    <Text style={[styles.modelBadgeText, { color: model.color }]}>{model.badge}</Text>
                  </View>
                  <Text style={[styles.modelName, selectedModel === model.id && styles.modelNameActive]}>
                    {model.label}
                  </Text>
                  <Text style={styles.modelProvider}>{model.provider}</Text>
                  <View style={[styles.modelQualityBadge, selectedModel === model.id && styles.modelQualityBadgeActive]}>
                    <Text style={[styles.modelQualityText, selectedModel === model.id && styles.modelQualityTextActive]}>
                      {model.quality}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Style Presets */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>STYLE PRESET</Text>
          <View style={styles.styleGrid}>
            {STYLE_PRESETS.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[styles.styleBtn, selectedStyle === style.id && styles.styleBtnActive]}
                onPress={() => setSelectedStyle(style.id)}
              >
                <Text style={styles.styleIcon}>{style.icon}</Text>
                <Text style={[styles.styleLabel, selectedStyle === style.id && styles.styleLabelActive]}>
                  {style.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Size Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OUTPUT SIZE</Text>
          <View style={styles.sizeRow}>
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size.id}
                style={[styles.sizeBtn, selectedSize === size.id && styles.sizeBtnActive]}
                onPress={() => setSelectedSize(size.id)}
              >
                <Text style={[styles.sizeRatio, selectedSize === size.id && styles.sizeRatioActive]}>
                  {size.label}
                </Text>
                <Text style={styles.sizeDesc}>{size.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, generating && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <View style={styles.generateBtnInner}>
              <ActivityIndicator color="#000000" size="small" />
              <Text style={styles.generateBtnText}>
                GENERATING WITH {modelData?.label?.toUpperCase()}...
              </Text>
            </View>
          ) : (
            <Text style={styles.generateBtnText}>✦ GENERATE IMAGE</Text>
          )}
        </TouchableOpacity>

        {/* Current Generated Image */}
        {currentImage && (
          <View style={styles.currentImageSection}>
            <View style={styles.currentImageHeader}>
              <Text style={styles.sectionLabel}>GENERATED</Text>
              <View style={styles.currentImageActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, savedIds.includes(currentImage.id) && styles.actionBtnSaved]}
                  onPress={() => saveImage(currentImage)}
                  disabled={saving || savedIds.includes(currentImage.id)}
                >
                  {saving ? (
                    <ActivityIndicator color={C.gold} size="small" />
                  ) : (
                    <Text style={styles.actionBtnText}>
                      {savedIds.includes(currentImage.id) ? '✓ SAVED' : '↓ SAVE'}
                    </Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => shareImage(currentImage)}>
                  <Text style={styles.actionBtnText}>⎙ SHARE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => setFullscreenImage(currentImage)}
                >
                  <Text style={styles.actionBtnText}>⛶ VIEW</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setFullscreenImage(currentImage)}
              activeOpacity={0.95}
            >
              <Image
                source={{ uri: currentImage.url }}
                style={styles.currentImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.currentImageMeta}>
              <View style={[styles.modelTagBadge, { backgroundColor: (MODELS.find(m => m.id === currentImage.model)?.color || C.gold) + '20' }]}>
                <Text style={[styles.modelTagText, { color: MODELS.find(m => m.id === currentImage.model)?.color || C.gold }]}>
                  {MODELS.find(m => m.id === currentImage.model)?.label || currentImage.model}
                </Text>
              </View>
              <Text style={styles.currentImagePrompt} numberOfLines={2}>
                "{currentImage.prompt}"
              </Text>
            </View>
          </View>
        )}

        {/* Image Grid */}
        {imageGrid.length > 0 && (
          <View style={styles.section}>
            <View style={styles.gridHeader}>
              <Text style={styles.sectionLabel}>GALLERY</Text>
              <Text style={styles.gridCount}>{imageGrid.length} IMAGES</Text>
            </View>
            <View style={styles.imageGrid}>
              {imageGrid.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.gridItem}
                  onPress={() => setFullscreenImage(item)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: item.url }} style={styles.gridImage} resizeMode="cover" />
                  <View style={styles.gridItemOverlay}>
                    <View style={[styles.gridModelDot, { backgroundColor: MODELS.find(m => m.id === item.model)?.color || C.gold }]} />
                  </View>
                  {savedIds.includes(item.id) && (
                    <View style={styles.gridSavedBadge}>
                      <Text style={styles.gridSavedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              {/* Empty slot placeholder */}
              <View style={styles.gridItemEmpty}>
                <Text style={styles.gridItemEmptyIcon}>+</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Prompts */}
        {imageGrid.length === 0 && (
          <View style={[styles.section, { marginTop: 8 }]}>
            <Text style={styles.sectionLabel}>QUICK PROMPTS</Text>
            <View style={styles.quickPromptsGrid}>
              {[
                'Luxury penthouse at sunset with gold interiors',
                'Abstract neural network visualization in dark theme',
                'Elite businessman in futuristic city skyline',
                'Premium product photography dark background',
              ].map((qp, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickPromptBtn}
                  onPress={() => setPrompt(qp)}
                >
                  <Text style={styles.quickPromptText}>{qp}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Fullscreen Image Modal */}
      <Modal visible={!!fullscreenImage} transparent animationType="fade">
        <View style={styles.fullscreenOverlay}>
          <TouchableOpacity
            style={styles.fullscreenClose}
            onPress={() => setFullscreenImage(null)}
          >
            <Text style={styles.fullscreenCloseText}>✕</Text>
          </TouchableOpacity>
          {fullscreenImage && (
            <>
              <Image
                source={{ uri: fullscreenImage.url }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
              <View style={styles.fullscreenMeta}>
                <Text style={styles.fullscreenPrompt} numberOfLines={2}>
                  "{fullscreenImage.prompt}"
                </Text>
                <View style={styles.fullscreenActions}>
                  <TouchableOpacity
                    style={styles.fullscreenBtn}
                    onPress={() => {
                      setFullscreenImage(null);
                      saveImage(fullscreenImage);
                    }}
                    disabled={savedIds.includes(fullscreenImage.id)}
                  >
                    <Text style={styles.fullscreenBtnText}>
                      {savedIds.includes(fullscreenImage.id) ? '✓ SAVED' : '↓ SAVE'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.fullscreenBtn}
                    onPress={() => shareImage(fullscreenImage)}
                  >
                    <Text style={styles.fullscreenBtnText}>⎙ SHARE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.gold + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: C.gold,
    fontWeight: '900',
    fontSize: 13,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: C.gold,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 1,
  },
  headerStats: {
    alignItems: 'flex-end',
  },
  headerStatValue: {
    color: C.gold,
    fontSize: 22,
    fontWeight: '900',
  },
  headerStatLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  promptSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  promptContainer: {
    position: 'relative',
  },
  promptInput: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.gold + '30',
    borderRadius: 16,
    padding: 14,
    paddingBottom: 50,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  promptSendBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptSendIcon: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
  },
  section: {
    marginBottom: 20,
  },
  modelRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modelCard: {
    width: 130,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  modelCardActive: {
    borderColor: C.gold,
    backgroundColor: C.gold + '10',
  },
  modelBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  modelBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modelName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  modelNameActive: {
    color: '#FFFFFF',
  },
  modelProvider: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '500',
  },
  modelQualityBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  modelQualityBadgeActive: {
    borderColor: C.gold + '50',
    backgroundColor: C.gold + '10',
  },
  modelQualityText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modelQualityTextActive: {
    color: C.gold,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: C.bgCard,
  },
  styleBtnActive: {
    borderColor: C.gold,
    backgroundColor: C.gold + '18',
  },
  styleIcon: {
    fontSize: 14,
  },
  styleLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
  },
  styleLabelActive: {
    color: C.gold,
    fontWeight: '700',
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: C.bgCard,
    alignItems: 'center',
    gap: 3,
  },
  sizeBtnActive: {
    borderColor: C.gold,
    backgroundColor: C.gold + '15',
  },
  sizeRatio: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '800',
  },
  sizeRatioActive: {
    color: C.gold,
  },
  sizeDesc: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  generateBtn: {
    backgroundColor: C.gold,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: C.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  generateBtnDisabled: {
    opacity: 0.75,
  },
  generateBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  generateBtnText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  currentImageSection: {
    marginBottom: 20,
  },
  currentImageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  currentImageActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.gold + '40',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionBtnSaved: {
    borderColor: '#22C55E40',
    backgroundColor: '#22C55E10',
  },
  actionBtnText: {
    color: C.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  currentImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
  },
  currentImageMeta: {
    marginTop: 10,
    gap: 6,
  },
  modelTagBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modelTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  currentImagePrompt: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  gridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridCount: {
    color: C.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridItemOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  gridModelDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  gridSavedBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#22C55E',
    borderRadius: 8,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridSavedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  gridItemEmpty: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  gridItemEmptyIcon: {
    color: C.gold,
    fontSize: 24,
    fontWeight: '300',
  },
  quickPromptsGrid: {
    gap: 8,
  },
  quickPromptBtn: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 12,
  },
  quickPromptText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    lineHeight: 18,
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  fullscreenMeta: {
    paddingHorizontal: 24,
    paddingTop: 16,
    width: '100%',
    gap: 14,
  },
  fullscreenPrompt: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  fullscreenActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  fullscreenBtn: {
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.gold + '40',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  fullscreenBtnText: {
    color: C.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
