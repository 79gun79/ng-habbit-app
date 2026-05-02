import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/auth";
import { supabase } from "@/utils/supabase";

const NUM_COLUMNS = 2;
const GAP = 12;
const PADDING = 16;
const ITEM_SIZE =
  (Dimensions.get("window").width - PADDING * 2 - GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;
const STORAGE_BUCKET = "photos";

interface Photo {
  id: number;
  src: string;
  description: string;
  created_at: string;
  user_name: string;
  user_id: string | null;
}

export default function GalleryScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();

  const openProfileDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [supabaseUidRef, setSupabaseUidRef] = useState<string | null>(null);

  // Supabase UID 미리 로드
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSupabaseUidRef(data.session?.user.id ?? null);
    });
  }, [user]);

  // 업로드 모달 상태
  const [uploadModal, setUploadModal] = useState(false);
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("photos")
      .select("id, src, description, created_at, user_name, user_id")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setPhotos(data as Photo[]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPhotos();
    }, [fetchPhotos]),
  );

  // 삭제
  const handleDelete = async (photo: Photo) => {
    Alert.alert("사진 삭제", "이 사진을 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            // Storage에서 파일명 추출 후 삭제
            const url = new URL(photo.src);
            const pathParts = url.pathname.split("/");
            const fileName = pathParts[pathParts.length - 1];
            await supabase.storage.from(STORAGE_BUCKET).remove([fileName]);
            // DB 삭제
            const { error } = await supabase
              .from("photos")
              .delete()
              .eq("id", photo.id);
            if (error) throw error;
            setSelected(null);
            await fetchPhotos();
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "삭제 실패";
            Alert.alert("삭제 실패", message);
          }
        },
      },
    ]);
  };

  // 이미지 피커 열기
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 접근 권한이 필요합니다.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPickedUri(result.assets[0].uri);
      setDescription("");
      setUploadModal(true);
    }
  };

  // Supabase Storage 업로드 + DB insert
  const handleUpload = async () => {
    if (!pickedUri || !user) return;
    setUploading(true);
    try {
      // 1) 이미지 → ArrayBuffer
      const response = await fetch(pickedUri);
      const arrayBuffer = await response.arrayBuffer();
      const ext = pickedUri.split(".").pop()?.toLowerCase() ?? "jpg";
      const fileName = `${user.id}_${Date.now()}.${ext}`;

      // 2) Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, arrayBuffer, {
          contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // 3) 공개 URL 가져오기
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;

      // 4) Supabase 세션 UID 가져오기
      const { data: sessionData } = await supabase.auth.getSession();
      const supabaseUid = sessionData.session?.user.id ?? null;

      // 5) photos 테이블에 insert
      const { error: insertError } = await supabase.from("photos").insert({
        src: publicUrl,
        description: description.trim(),
        user_id: supabaseUid,
        user_name: user.name,
        user_email: user.email,
      });
      if (insertError) throw insertError;

      setUploadModal(false);
      setPickedUri(null);
      setDescription("");
      await fetchPhotos();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "업로드 실패";
      Alert.alert("업로드 실패", message);
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => setSelected(item)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.src }}
        style={styles.image}
        resizeMode="cover"
      />
      {item.description ? (
        <Text style={styles.caption} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>갤러리</Text>
          <Text style={styles.subtitle}>{photos.length}개의 사진</Text>
        </View>
        <TouchableOpacity onPress={openProfileDrawer} activeOpacity={0.8}>
          {user?.picture ? (
            <Image source={{ uri: user.picture }} style={styles.avatar} />
          ) : (
            <View style={styles.headerBadge}>
              <Ionicons name="person" size={20} color="#08111F" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#08111F" />
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="images-outline" size={56} color="#D0D0D0" />
          <Text style={styles.emptyText}>사진이 없어요</Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB - 사진 추가 */}
      <TouchableOpacity
        style={styles.fab}
        onPress={pickImage}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 사진 상세 모달 */}
      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          {selected && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: selected.src }}
                style={styles.modalImage}
                resizeMode="contain"
              />
              {selected.description ? (
                <Text style={styles.modalDescription}>
                  {selected.description}
                </Text>
              ) : null}
              <Text style={styles.modalMeta}>
                {selected.user_name} ·{" "}
                {new Date(selected.created_at).toLocaleDateString("ko-KR")}
              </Text>
              {selected.user_id === supabaseUidRef && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(selected)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF5252" />
                  <Text style={styles.deleteBtnText}>삭제</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Modal>

      {/* 업로드 모달 */}
      <Modal
        visible={uploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => !uploading && setUploadModal(false)}
      >
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadSheet}>
            <Text style={styles.uploadTitle}>사진 추가</Text>

            {pickedUri && (
              <Image
                source={{ uri: pickedUri }}
                style={styles.preview}
                resizeMode="cover"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="설명을 입력하세요 (선택)"
              placeholderTextColor="#BDBDBD"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
              editable={!uploading}
            />

            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setUploadModal(false)}
                disabled={uploading}
              >
                <Text style={styles.cancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  uploading && styles.confirmBtnDisabled,
                ]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmText}>올리기</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: PADDING,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: "#F8F8FA",
  },
  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8EAEC",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#08111F",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#BDBDBD",
  },
  grid: {
    paddingHorizontal: PADDING,
    paddingBottom: 32,
  },
  row: {
    gap: GAP,
    marginBottom: GAP,
  },
  item: {
    width: ITEM_SIZE,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  image: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
  },
  caption: {
    fontSize: 12,
    color: "#555",
    padding: 8,
    lineHeight: 16,
  },
  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  modalImage: {
    width: "100%",
    height: Dimensions.get("window").width * 0.9,
    borderRadius: 12,
  },
  modalDescription: {
    color: "#FFFFFF",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  modalMeta: {
    color: "#AAAAAA",
    fontSize: 13,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF5252",
    marginTop: 4,
  },
  deleteBtnText: {
    color: "#FF5252",
    fontSize: 14,
    fontWeight: "600",
  },
  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#08111F",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  // 업로드 모달
  uploadOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  uploadSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#08111F",
    textAlign: "center",
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1A1A2E",
    minHeight: 60,
    textAlignVertical: "top",
  },
  uploadActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    color: "#666",
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#08111F",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.6,
  },
  confirmText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
