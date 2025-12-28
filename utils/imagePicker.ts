import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

export const requestCameraPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      '권한 필요',
      '사진을 찍으려면 카메라 권한이 필요해요. 설정에서 권한을 허용해주세요.'
    );
    return false;
  }

  return true;
};

export const requestMediaLibraryPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return true;
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      '권한 필요',
      '사진을 선택하려면 갤러리 권한이 필요해요. 설정에서 권한을 허용해주세요.'
    );
    return false;
  }

  return true;
};

export const takePhoto = async (): Promise<ImagePickerResult | null> => {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to take photo:', error);
    Alert.alert('오류', '사진을 찍는데 실패했어요. 다시 시도해주세요.');
    return null;
  }
};

export const pickImage = async (): Promise<ImagePickerResult | null> => {
  try {
    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to pick image:', error);
    Alert.alert('오류', '사진을 선택하는데 실패했어요. 다시 시도해주세요.');
    return null;
  }
};

export const pickImageWithOptions = async (): Promise<ImagePickerResult | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      '사진 선택',
      '어떻게 사진을 추가할까요?',
      [
        {
          text: '카메라로 촬영',
          onPress: async () => {
            const result = await takePhoto();
            resolve(result);
          },
        },
        {
          text: '갤러리에서 선택',
          onPress: async () => {
            const result = await pickImage();
            resolve(result);
          },
        },
        {
          text: '취소',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};
