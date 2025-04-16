import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Linking,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Ionicons } from "@expo/vector-icons";

const WorkerOrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceInputs, setPriceInputs] = useState<{ [key: string]: string }>({});

  const fetchOrders = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        notes,
        price,
        client_id,
        users:client_id (
          username,
          latitude,
          longitude
        )
      `
      )
      .eq("worker_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("خطأ", "تعذر تحميل الطلبات");
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  const handleOpenMap = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("خطأ", "تطبيق الخرائط غير مثبت على الجهاز");
      }
    });
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      Alert.alert("خطأ", "تعذر تحديث الحالة");
    } else {
      fetchOrders();
    }
  };

  const updatePrice = async (orderId: string, price: string) => {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      Alert.alert("⚠️", "يرجى إدخال سعر صالح");
      return;
    }

    const { error } = await supabase
      .from("orders")
      .update({ price: parsedPrice })
      .eq("id", orderId);

    if (error) {
      Alert.alert("خطأ", "تعذر حفظ السعر");
    } else {
      Alert.alert("✅", "تم حفظ السعر");
      fetchOrders();
    }
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Text style={[styles.status, { color: "#f39c12" }]}>
            قيد الانتظار ⏳
          </Text>
        );
      case "accepted":
        return (
          <Text style={[styles.status, { color: "#2ecc71" }]}>
            تم القبول ✅
          </Text>
        );
      case "rejected":
        return (
          <Text style={[styles.status, { color: "#e74c3c" }]}>مرفوض ❌</Text>
        );
      case "cancelled":
        return (
          <Text style={[styles.status, { color: "#999" }]}>🚫 تم الإلغاء</Text>
        );
      default:
        return <Text style={styles.status}>—</Text>;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>الطلبات الواردة</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1abc9c" />
      ) : orders.length === 0 ? (
        <Text style={styles.noData}>لا توجد طلبات حالياً</Text>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Ionicons name="person-circle-outline" size={28} color="#1abc9c" />
            <Text style={styles.info}>
              العميل: {order.users?.username ?? "غير معروف"}
            </Text>

            <Text style={styles.note}>💬 الملاحظة: {order.notes || "—"}</Text>
            {renderStatus(order.status)}

            {order.status === "accepted" && order.price && (
              <Text style={styles.price}>💵 السعر: {order.price} ريال</Text>
            )}

            {order.status === "accepted" &&
              order.users?.latitude &&
              order.users?.longitude && (
                <TouchableOpacity
                  onPress={() =>
                    handleOpenMap(order.users.latitude, order.users.longitude)
                  }
                  style={styles.locationLink}
                >
                  <Text style={styles.linkText}>عرض الموقع على الخريطة 🗺️</Text>
                </TouchableOpacity>
              )}

            {order.status === "pending" && (
              <>
                <TextInput
                  placeholder="أدخل السعر المقترح"
                  keyboardType="numeric"
                  value={priceInputs[order.id] || ""}
                  onChangeText={(value) =>
                    setPriceInputs((prev) => ({ ...prev, [order.id]: value }))
                  }
                  style={styles.input}
                />

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={async () => {
                      await updateOrderStatus(order.id, "accepted");
                      if (priceInputs[order.id]) {
                        await updatePrice(order.id, priceInputs[order.id]);
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>قبول الطلب</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => updateOrderStatus(order.id, "rejected")}
                  >
                    <Text style={styles.buttonText}>رفض الطلب</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1abc9c",
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: "#f8f9fa",
    elevation: 2,
  },
  info: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  note: {
    fontSize: 14,
    color: "#555",
    marginVertical: 6,
  },
  price: {
    fontSize: 15,
    color: "#1abc9c",
    fontWeight: "bold",
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  acceptButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  rejectButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 30,
  },
  locationLink: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#3498db",
    borderRadius: 8,
    alignItems: "center",
  },
  linkText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default WorkerOrdersScreen;
