export function validateForm(data, isEdit = false) {
  const errors = {};
  if (!isEdit || data.name !== undefined) {
    if (!data.name?.trim()) errors.name = "กรุณากรอกชื่อ";
  }
  if (!isEdit || data.email !== undefined) {
    if (!data.email?.trim()) errors.email = "กรุณากรอก Email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "รูปแบบ Email ไม่ถูกต้อง";
  }
  if (!isEdit || data.phone !== undefined) {
    if (!data.phone?.trim()) errors.phone = "กรุณากรอกเบอร์โทร";
    else if (!/^\d{9,15}$/.test(data.phone.replace(/[-\s]/g, ""))) errors.phone = "เบอร์โทรต้องเป็นตัวเลข 9-15 หลัก";
  }
  if (!isEdit || data.position !== undefined) {
    if (!data.position?.trim()) errors.position = "กรุณาเลือกตำแหน่ง";
  }
  return errors;
}
