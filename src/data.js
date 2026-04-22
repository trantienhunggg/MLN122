// ===== KIMBAP INGREDIENTS (Items for spinner) =====
export const KIMBAP_INGREDIENTS = [
  { name: 'Cơm cuộn', emoji: '🍙', color: '#FFD700', rarity: 'common' },
  { name: 'Rong biển', emoji: '🌿', color: '#2E8B57', rarity: 'common' },
  { name: 'Cà rốt', emoji: '🥕', color: '#FF6B35', rarity: 'common' },
  { name: 'Dưa leo', emoji: '🥒', color: '#4CAF50', rarity: 'common' },
  { name: 'Trứng', emoji: '🥚', color: '#FFF176', rarity: 'common' },
  { name: 'Thanh cua', emoji: '🦀', color: '#FF5252', rarity: 'uncommon' },
  { name: 'Kim chi', emoji: '🌶️', color: '#E53935', rarity: 'uncommon' },
  { name: 'Phô mai', emoji: '🧀', color: '#FFCA28', rarity: 'uncommon' },
  { name: 'Xúc xích', emoji: '🌭', color: '#BF360C', rarity: 'uncommon' },
  { name: 'Thịt bò', emoji: '🥩', color: '#8D6E63', rarity: 'rare' },
  { name: 'Vừng', emoji: '🫙', color: '#F5DEB3', rarity: 'common' },
  { name: 'Dầu mè', emoji: '🫒', color: '#8BC34A', rarity: 'common' },
]

// ===== TEAM COLORS =====
export const TEAM_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#F8A5C2', '#F7DC6F',
  '#82E0AA', '#AED6F1',
]

// ===== WRONG ANSWER REACTIONS =====
export const WRONG_REACTIONS = [
  { emoji: '😂', text: 'Lêu Lêu sai rồi!' },
  { emoji: '🤣', text: 'Chưa đúng rồi bạn ơi~' },
  { emoji: '😜', text: 'Ối trời! Sai bét rồi!' },
  { emoji: '😝', text: 'Trật lất bạn ơi ơi!' },
  { emoji: '🙈', text: 'Ủa sao sai được vậy?' },
  { emoji: '😤', text: 'Cố lên! Gần đúng rồi!' },
  { emoji: '🤦', text: 'Trời ơi... sai rồi!' },
  { emoji: '😬', text: 'Hmm, chưa chính xác!' },
  { emoji: '🫠', text: 'Ohh nooo sai mất rồi!' },
  { emoji: '🥲', text: 'Buồn quá... sai rồi bạn ơi!' },
]

// ===== PUZZLE IMAGE (Hidden behind cells) =====
export const PUZZLE_IMAGE_URL = '/Picture1.png'
export const GRID_CONFIG = { ROWS: 5, COLS: 6 }

// ===== 30 TIERED QUESTIONS (Mác-Lênin) =====
// Tier 3: 3 spins (One try only, 45s)
// Tier 2: 2 spins (17s -> 10s -> 5s)
// Tier 1: 1 spin (17s -> 8s -> 5s)
export const QUESTIONS = [
  { id: 1, tier: 1, question: 'Khối lượng giá trị thặng dư (M) được tính bằng công thức', type: 'multiple', options: ['M = m\'. K', 'M = m\'. C', 'M = m\'. V', 'M = m\'. V\''], answer: 2 },
  { id: 2, tier: 1, question: 'Mâu thuẫn chung trong công thức chung của tư bản là:', type: 'multiple', options: ['T\' > T', 'T\' < T', 'T\' = T', 'T\' > H\''], answer: 0 },
  { id: 3, tier: 1, question: 'Công thức chung của tư bản là:', type: 'multiple', options: ['H-T-H', 'T-H-T\'', 'T-H-T', 'H-T\'-H'], answer: 1 },
  { id: 4, tier: 1, question: 'Khối lượng giá trị thặng dư được tính bằng công thức nào?', type: 'multiple', options: ['M = m\' x p\'', 'M = m\' x V', 'M = m\' x t\'', 'M = V / m\''], answer: 1 },
  { id: 5, tier: 1, question: 'Theo công thức chung của tư bản thì T\' được tính như thế nào?', type: 'multiple', options: ['T\'= T + t (t>0)', 'T\'= T + t (t<0)', 'T\'= T + t (t>=0)', 'T\'= T + t + t (t<=0)'], answer: 0 },
  { id: 6, tier: 1, question: 'Phép biện chứng duy vật được xây dựng trên cơ sở nào?', type: 'multiple', options: ['Phép Hegel', 'Duy vật Feuerbach', 'Kết hợp cả hai', 'Triết học Hy Lạp'], answer: 2 },
  { id: 7, tier: 1, question: 'Tác phẩm "Bộ Tư Bản" xuất bản tập 1 năm nào?', type: 'multiple', options: ['1848', '1867', '1883', '1871'], answer: 1 },
  { id: 8, tier: 1, question: 'Nguồn gốc của giá trị thặng dư là gì?', type: 'multiple', options: ['Lợi nhuận buôn bán', 'Lao động bị chiếm đoạt', 'Tài nguyên', 'Vốn đầu tư'], answer: 1 },
  { id: 9, tier: 1, question: 'Cách mạng Tháng Mười Nga nổ ra năm nào?', type: 'multiple', options: ['1905', '1917', '1921', '1914'], answer: 1 },
  { id: 10, tier: 1, question: 'Đảng Cộng sản Việt Nam thành lập năm nào?', type: 'multiple', options: ['1925', '1930', '1945', '1954'], answer: 1 },
  { id: 11, tier: 2, question: 'Đặc trưng cơ bản của chủ nghĩa đế quốc theo Lênin?', type: 'multiple', options: ['Cạnh tranh tự do', 'Sự thống trị của tư bản tài chính', 'Phát triển công nghiệp', 'Thương mại quốc tế'], answer: 1 },
  { id: 12, tier: 2, question: 'Quy luật cơ bản nhất của phép biện chứng duy vật?', type: 'multiple', options: ['Lượng - chất', 'Phủ định', 'Thống nhất và đấu tranh mặt đối lập', 'Nhân quả'], answer: 2 },
  { id: 13, tier: 2, question: 'Hồ Chí Minh tìm thấy con đường cứu nước qua tác phẩm nào?', type: 'multiple', options: ['Nhà nước & Cách mạng', 'Sơ thảo đề cương về dân tộc', 'Bút ký triết học', 'Chế độ thuộc địa'], answer: 1 },
  { id: 15, tier: 1, question: '1+1=?', type: 'multiple', options: ['1', '2', '3', '4'], answer: 1 },
  { id: 16, tier: 1, question: 'Vật chất theo triết học Mác-Lênin là gì?', type: 'multiple', options: ['Sự vật hiện tượng', 'Tri thực tại khách quan', 'Nguyên tử', 'Năng lượng'], answer: 1 },
  { id: 17, tier: 1, question: 'Giai cấp vô sản là giai cấp nào?', type: 'multiple', options: ['Bán sức lao động', 'Nông dân nghèo', 'Trí thức', 'Tiểu tư sản'], answer: 0 },
  { id: 18, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/kienthuc.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1 },
  { id: 19, tier: 1, question: 'Phương thức sản xuất gồm những yếu tố nào?', type: 'multiple', options: ['LLSX và QHSX', 'Công cụ và đối tượng', 'CSHT và KTTT', 'Kinh tế và chính trị'], answer: 0 },
  { id: 20, tier: 1, question: 'Cách mạng XHCN khác CM tư sản ở điểm nào?', type: 'multiple', options: ['Lãnh đạo', 'Xóa bỏ tư hữu', 'Phương pháp', 'Mục tiêu'], answer: 1 },
  { id: 14, tier: 1, question: '2 con vịt đi trước 2 con vịt\n2 con vịt đi sau 2 con vịt\n2 con vịt đi giữa 2 con vịt\nHỏi có mấy con vịt?', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1 },
  { id: 21, tier: 1, question: '"Chủ nghĩa đế quốc - giai đoạn tột cùng của CNTB" là của ai?', type: 'multiple', options: ['Marx', 'Engels', 'Lênin', 'Stalin'], answer: 2 },
  { id: 22, tier: 1, question: 'Giá trị hàng hóa được đo bằng gì?', type: 'multiple', options: ['Tiền vốn', 'Thời gian lao động cần thiết', 'Giá thị trường', 'Công sức'], answer: 1 },
  { id: 23, tier: 2, question: 'Kiến trúc thượng tầng bao gồm những gì?', type: 'multiple', options: ['Nhà nước, pháp luật, ý thức', 'Công nghệ', 'Sản xuất', 'Tài nguyên'], answer: 0 },
  { id: 26, tier: 2, question: 'Theo Mác, hàng hóa có mấy thuộc tính?', type: 'multiple', options: ['1', '2', '3', '4'], answer: 1 },
  { id: 28, tier: 3, question: 'Quy luật lượng – chất thể hiện điều gì? (ĐẶC BIÊT)', type: 'multiple', options: ['Mâu thuẫn', 'Sự chuyển hóa lượng thành chất', 'Phủ định', 'Mối liên hệ'], answer: 1 },
  { id: 29, tier: 3, question: 'Đảng Bôn-sê-vích do ai sáng lập? (ĐẶC BIỆT)', type: 'multiple', options: ['Plekhanov', 'V.I. Lênin', 'Trotsky', 'Stalin'], answer: 1 },
  { id: 30, tier: 3, question: 'Tư tưởng Hồ Chí Minh là sự vận dụng sáng tạo chủ nghĩa nào? (ĐẶC BIỆT)', type: 'multiple', options: ['Dân chủ tư sản', 'Mác-Lênin', 'Dân tộc', 'Nhân văn'], answer: 1 },
  { id: 31, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/3sao7ban.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1 },
  { id: 32, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/6.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1 },
  { id: 33, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/giandiep.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1 },
]
