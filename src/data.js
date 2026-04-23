// ===== KIMBAP INGREDIENTS (Items for spinner) =====
export const KIMBAP_INGREDIENTS = [
  { name: 'Cơm', emoji: '🍚', color: '#FFD700', rarity: 'common' },
  { name: 'Lá kim', emoji: '🌿', color: '#2E8B57', rarity: 'common' },
  { name: 'Cà rốt + Dưa leo', emoji: '🥕', color: '#FF6B35', rarity: 'common' },
  { name: 'Trứng', emoji: '🍳', color: '#FFF176', rarity: 'common' },
  { name: 'Xúc xích', emoji: '🌭', color: '#BF360C', rarity: 'uncommon' },
  { name: 'Dầu mè + mè rang', emoji: '💧', color: '#8BC34A', rarity: 'common' },
  { name: 'Thanh cua', emoji: '🦀', color: '#FF5252', rarity: 'uncommon' },
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
// Tier 3: 3 spins (15s -> 10s -> 5s)
// Tier 2: 2 spins (15s -> 10s -> 5s)
// Tier 1: 1 spin (15s -> 10s -> 5s)
export const QUESTIONS = [
  { id: 15, tier: 1, question: 'Khối lượng giá trị thặng dư (M) được tính bằng công thức', type: 'multiple', options: ['M = m\'. K', 'M = m\'. C', 'M = m\'. V', 'M = m\'. V\''], answer: 2 },
  { id: 27, tier: 1, question: 'Mâu thuẫn chung trong công thức chung của tư bản là:', type: 'multiple', options: ['T\' > T', 'T\' < T', 'T\' = T', 'T\' > H\''], answer: 0 },
  { id: 4, tier: 1, question: 'Công thức chung của tư bản là:', type: 'multiple', options: ['H-T-H', 'T-H-T\'', 'T-H-T', 'H-T\'-H'], answer: 1 },
  { id: 18, tier: 1, question: 'Khối lượng giá trị thặng dư được tính bằng công thức nào?', type: 'multiple', options: ['M = m\' x p\'', 'M = m\' x V', 'M = m\' x t\'', 'M = V / m\''], answer: 1 },
  { id: 9, tier: 1, question: 'Theo công thức chung của tư bản thì T\' được tính như thế nào?', type: 'multiple', options: ['T\'= T + t (t>0)', 'T\'= T + t (t<0)', 'T\'= T + t (t>=0)', 'T\'= T + t + t (t<=0)'], answer: 0 },
  { id: 3, tier: 1, question: 'Hai thuộc tính của hàng hóa là:', type: 'multiple', options: ['Giá trị & giá cả', 'Giá trị sử dụng & giá trị', 'Giá trị & tiền', 'Lao động & sản phẩm'], answer: 1 },
  { id: 21, tier: 1, question: 'Hàng hóa là gì?', type: 'multiple', options: ['Sản phẩm để tiêu dùng', 'Sản phẩm trao đổi mua bán', 'Sản phẩm tự nhiên', 'Sản phẩm không có giá trị'], answer: 1 },
  { id: 11, tier: 1, question: 'Nguồn gốc của giá trị thặng dư là gì?', type: 'multiple', options: ['Lợi nhuận buôn bán', 'Lao động bị chiếm đoạt', 'Tài nguyên', 'Vốn đầu tư'], answer: 0 },
  { id: 29, tier: 1, question: 'Thứ gì sinh ra tiền nhưng bản thân nó cũng là một loại hàng hóa?', type: 'multiple', options: ['Vốn', 'Hàng hóa', 'Lao động', 'Sức lao động'], answer: 3 },
  { id: 6, tier: 1, question: 'Thứ gì càng sản xuất nhiều thì giá trị đơn vị lại càng giảm?', type: 'multiple', options: ['Vốn', 'Lao động', 'Năng suất lao động ', 'Công nghệ'], answer: 2 },
  { id: 14, tier: 1, question: 'Bố mẹ có 6 người con trai, mỗi người con trai có 1 em gái. Hỏi gia đình có mấy người?', type: 'multiple', options: ['6', '7', '8', '9'], answer: 3 },
  { id: 25, tier: 1, question: 'Dịch nghĩa câu sau: "tư khư bàn khan khà kha biền khiên"?', type: 'multiple', options: ['Tư bản khả biến', 'Tư bản bất biến', 'Phủ định', 'Nhân quả'], answer: 0 },
  { id: 8, tier: 1, question: 'Xe gì không có bánh mà vẫn biết đi?', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'XE TRONG CỜ VUA' },
  { id: 30, tier: 1, question: '1+1=?', type: 'multiple', options: ['1', '2', '3', '4'], answer: 2 },
  { id: 2, tier: 1, question: 'ậ/L/n/ợ/i/h/u/n', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'LỢI NHUẬN' },
  { id: 12, tier: 1, question: 'o/L/ộ/a/đ/g/n', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'LAO ĐỘNG' },
  { id: 19, tier: 1, question: '/a/h/ó/n/g/à/H', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'HÀNG HÓA' },
  { id: 7, tier: 1, question: 'ư/g/d/h/ặ/n/T', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'THẶNG DƯ' },
  { id: 23, tier: 1, question: '2 con vịt đi trước 2 con vịt\n2 con vịt đi sau 2 con vịt\n2 con vịt đi giữa 2 con vịt\nHỏi có mấy con vịt?', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: '4 CON VỊT' },
  { id: 10, tier: 1, question: 'q/Đ/u/ề/n/ộ/y/c', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'ĐỘC QUYỀN' },
  { id: 26, tier: 1, question: '3+5x4-8 = ?', type: 'multiple', options: ['12', '18', '15', '13'], answer: 1 },
  { id: 17, tier: 1, question: 't/ả/x/T/i/s/á/u/n/ấ', type: 'guess', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'TÀI SẢN' },

  { id: 13, tier: 3, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/C.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'C' },
  { id: 20, tier: 3, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/28.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: '28' },
  { id: 5, tier: 3, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/21.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: '21' },

  { id: 22, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/3sao7ban.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'TAM SAO THẤT BẢN' },
  { id: 16, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/6.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'SỐ 6' },
  { id: 28, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/giandiep.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'GIÁN ĐIỆP' },
  { id: 1, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/dgxichdao.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'ĐƯỜNG XÍCH ĐẠO' },
  { id: 24, tier: 2, question: 'Nhìn hình đoán chữ:', type: 'guess', image: '/kienthuc.png', options: ['❓ ĐÁP ÁN LÀ GÌ? ❓'], answer: 1, answerText: 'KIẾN THỨC' },
]
