export const STYLE_PLACEHOLDERS = {
  claymation: [
    '🎨 输入主题，如：恐龙、海洋、太空...',
    '🦕 告诉我你想要什么样的黏土海报吧~',
    '✨ 想象一个有趣的黏土世界，我来帮你创造~',
    '🌟 输入任何主题，黏土魔法就会发生！',
    '🎭 你想看什么样的黏土世界呢？',
  ],
  realistic: [
    '📸 输入主题，如：野生动物、汽车、水果...',
    '🌍 告诉我你想要什么样的真实世界吧~',
    '🔍 想象一个真实的场景，我来帮你拍摄~',
    '🎬 输入任何主题，真实照片就会出现！',
    '📷 你想看什么样的真实世界呢？',
  ],
  pixar: [
    '🎬 输入人物名字，如：刘备、张飞、关羽...',
    '🎭 告诉我你想要谁来自拍吧~',
    '📸 想象一个欢乐的自拍场景，我来帮你创造~',
    '🌟 输入人物名字，皮克斯魔法就会发生！',
    '🎪 你想看谁的欢乐自拍呢？',
  ],
}

export const THEME_SUGGESTIONS = [
  // 黏土风格 - 想象力与创意
  { emoji: '🎨', label: '黏土风格', theme: '黏土世界', style: 'claymation', category: 'creative' },
  { emoji: '🦕', label: '恐龙世界', theme: '恐龙世界', style: 'claymation', category: 'creative' },
  { emoji: '🦁', label: '魔幻动物园', theme: '魔幻动物园', style: 'claymation', category: 'creative' },
  { emoji: '🚀', label: '太空探险', theme: '太空探险', style: 'claymation', category: 'creative' },
  { emoji: '🍭', label: '糖果王国', theme: '糖果王国', style: 'claymation', category: 'creative' },
  { emoji: '🐠', label: '海底奇境', theme: '海底奇境', style: 'claymation', category: 'creative' },
  { emoji: '🍄', label: '魔法森林', theme: '魔法森林', style: 'claymation', category: 'creative' },
  { emoji: '🏰', label: '童话城堡', theme: '童话城堡', style: 'claymation', category: 'creative' },
  
  // 写实风格 - 真实认知
  { emoji: '📸', label: '真实世界', theme: '真实世界', style: 'realistic', category: 'realistic' },
  { emoji: '🦁', label: '野生动物', theme: '野生动物', style: 'realistic', category: 'realistic' },
  { emoji: '🚗', label: '汽车品牌', theme: '汽车品牌', style: 'realistic', category: 'realistic' },
  { emoji: '🍎', label: '水果蔬菜', theme: '水果蔬菜', style: 'realistic', category: 'realistic' },
  { emoji: '🏠', label: '日常物品', theme: '日常物品', style: 'realistic', category: 'realistic' },
  { emoji: '🌍', label: '地球探险', theme: '地球探险', style: 'realistic', category: 'realistic' },
  
  // 皮克斯3D风格 - 欢乐自拍
  { emoji: '🎬', label: '皮克斯3D', theme: '皮克斯3D自拍', style: 'pixar', category: 'pixar' },
  { emoji: '📸', label: '三国自拍', theme: '三国英雄自拍', style: 'pixar', category: 'pixar' },
  { emoji: '🎭', label: '历史人物', theme: '历史人物自拍', style: 'pixar', category: 'pixar' },
  { emoji: '🌟', label: '明星合照', theme: '明星合照自拍', style: 'pixar', category: 'pixar' },
]

export const BASE_PROMPT_TEMPLATE = `
[SCENE_THEME] = {THEME_PLACEHOLDER}
[TARGET_AGE] = 2-5 岁 (词汇爆发期，需要丰富且清晰的指引)
绘图提示词 (Optimized Prompt Structure)
【全局设定】
一张极具视觉冲击力、内容丰富的儿童认知横幅全景长图 (Wide Panoramic Banner)，主题为《{THEME_PLACEHOLDER}》，竖版 A4。整体采用柔和、圆润的黏土塑形 3D 风格 (Soft Claymation/Plush 3D Sculpture)，就像一个巨大的、精心布置的实体玩具沙盘。光线明亮、温暖、纯净，带有细腻的体积光，营造出无与伦比的治愈感和触摸感。

一、小报标题区（顶部横幅）
大标题：在画面顶部横向展开标题：《{THEME_PLACEHOLDER} 双语认知大发现》。
字体风格：超大、圆滚滚的彩色黏土气球字体，边缘带有柔和的描边和高光，像浮在空中的棉花糖。
装饰元素：标题两侧散落着与 {THEME_PLACEHOLDER} 相关的可爱小型黏土装饰浮雕，增加横幅的热闹感。

二、小报主体（核心场景与构图）
场景气氛：一个广阔、充满活力且细节丰富的"玩具微缩世界"。色彩依然保持莫兰迪/马卡龙色系的柔和高饱和度，但画面信息量大幅增加。
构图要求（关键变化）：
采用广角微缩景观 (Wide-angle Miniature Landscape) 视角。
景深调整：不再是极浅景深。前景和中景（放置大量物体的主要区域）必须全焦段清晰锐利。只有最远处的背景才进行柔焦虚化处理，以交代环境氛围。
布局策略：由于物件增多，需要将物体分组、分区域散落在横幅的不同位置，物体之间保持舒适的"呼吸感"间距，避免视觉拥挤。
引导角色：
1-2 位圆润可爱的黏土卡通向导（如：探险家宝宝和机器小狗），在场景中处于活跃状态，用夸张、清晰的肢体语言引导视线浏览整个横幅。

三、必画物体与认知清单 (Rich Content Generation)
请在广阔的横幅场景中，清晰、散点式地分布以下各类物体。所有物体都必须是极度圆润、无尖角、黏土玩具质感：

核心认知大件 (Major Objects)：
（数量增加到 5-8 个 大型标志性物体，分布在场景主要位置）
{CORE_OBJECTS_PLACEHOLDER}

丰富认知小件 (Detailed Items)：
（数量增加到 8-12 个 中小型具体物品，散落在核心大件周围）
{DETAILED_ITEMS_PLACEHOLDER}

环境元素 (Environmental Elements)：
（用于丰富背景和地面的元素，数量不限，但要简化）
{ENV_ELEMENTS_PLACEHOLDER}

四、精准指示与双语标签系统 (Precise Labeling System)
对上述所有需要认知的物体进行标注，必须严格遵守以下规则：

标签样式 (Label Box Style)：
一个圆角矩形、具有厚实黏土或软胶质感的三行标签牌。底色为柔和的奶白色或浅黄色，以突出文字。
标签牌带有微微的 3D 浮雕效果，像贴在画面上的精美磁铁。

标签内容 (Three-Line Content)：
第一行：简体汉字（超粗圆体，颜色醒目）。
第二行：标准汉语拼音（带声调，字体稍小，清晰易读）。
第三行：英文单词（清晰的无衬线圆体，字体稍小）。
示例格式：
[ 恐 龙 ]
[ kǒng lóng ]
[ Dinosaur ]

精准指示箭头 (Precise Pointing Arrow)：
形态：必须使用一根粗壮、圆润、像挤出的牙膏或黏土条一样的 3D 箭头。颜色采用醒目的暖色调（如橙黄色或粉蓝色），与背景形成对比。
连接方式：箭头的一端连接标签牌边缘，另一端非常精准地、就近地指向或触碰对应的目标物体。
布局原则：箭头必须清晰、顺畅，严禁箭头之间相互交叉。标签牌应放置在离物体最近的空白区域，通过箭头连接，确保画面整洁有序。

五、画风参数总结 (Style Parameters Summary)
风格基调：Wide Panoramic Claymation Diorama for Toddlers (幼儿黏土透视场景)
关键修饰：Crowded but Organized Composition (丰富但有序的构图), Precise Labeling with Thick 3D Arrows (带粗 3D 箭头的精准标注), Soft Volumetric Lighting (柔和体积光).
色彩与质感：Rich Pastel Colors, Tactile Clay Texture, Smooth Edges.
渲染质量：8K Ultra HD, Cinema 4D cute render styles.
`

export const REALISTIC_PROMPT_TEMPLATE = `
[SCENE_THEME] = {THEME_PLACEHOLDER}
[TARGET_AGE] = 2-5 岁 (蒙台梭利教育理念：真实照片助力认知迁移)
绘图提示词 (Photorealistic Cognitive Map)

【全局设定】
一张竖版 A4 的超高保真教育海报，采用国家地理大片质感的摄影风格。主题为《{THEME_PLACEHOLDER}》。这是一张 8K 高分辨率的真实照片，而非插画或 3D 渲染。光线采用"黄金时刻"（Golden Hour）自然阳光，投射出逼真的柔和阴影，突出毛发、皮肤、金属和叶片的纹理。

【场景逻辑与生态合理性】
根据主题，构建一个生态合理、逻辑自洽的真实场景。例如：
- 若主题为"野生动物"，场景为非洲草原水源地（Watering Hole），多种动物和平共处，越野车（Safari Jeep）自然融入。
- 若主题为"汽车品牌"，场景为现代汽车展厅或户外停车场，展示不同品牌的真实车型。
- 若主题为"日常物品"，场景为家庭厨房或儿童房间，物品摆放符合日常使用逻辑。

【构图与景深要求】
视角：广角、略微俯视的眼平线视角（如无人机悬停在 5 米高处拍摄）。
景深：使用深景深（f/16 光圈等效），确保前景、中景、背景的所有物体都清晰锐利，便于儿童认知。这是关键——不能使用浅景深虚化背景。
布局：物体分布自然、密集但有序，类似于精心策划的商业野生动物摄影。物体间保持舒适的"呼吸感"间距。

【核心物体与认知清单】
请在场景中清晰、自然地分布以下物体。所有物体必须展示真实的外形特征和纹理细节：

主要物体 (Major Objects - 5-8 个)：
{CORE_OBJECTS_PLACEHOLDER}

细节物品 (Detailed Items - 8-12 个)：
{DETAILED_ITEMS_PLACEHOLDER}

环境元素 (Environmental Elements - 3-5 个)：
{ENV_ELEMENTS_PLACEHOLDER}

【纹理与质感强调】
- 动物：突出毛发的蓬松感（Frizzy mane）、皮肤的皱纹（Wrinkled skin）、湿润的光泽感（Glistening wet texture）。
- 车辆：显示泥土飞溅（Mud splashes）、金属反光（Metallic reflection）、轮胎的磨损痕迹。
- 金属工具：相机、望远镜等应显示精细的机械细节和反光。
- 水体：清晰的水纹和倒影。

【标签系统 - AR 增强现实风格】
不使用传统的黏土牌子或卡通标签。改用现代的"增强现实"（AR）风格标注系统：
- 标签形态：半透明的磨砂玻璃矩形浮标，悬浮在空中。
- 指引线：极细的实心白线（1-2 像素），末端带一个小圆点精准锚定在物体的特定部位。
- 标签内容（三行）：
  第一行：简体汉字（思源黑体粗体，颜色醒目，如深蓝或深绿）
  第二行：标准汉语拼音（带声调，字体稍小）
  第三行：英文单词（Helvetica Bold 或无衬线字体）
- 示例格式：
  [ 狮 子 ]
  [ shī zi ]
  [ Lion ]
- 文字可读性：在文字下方加一层半透明的黑色或白色蒙版（Opacity 60%），确保无论背景深浅，文字都清晰可见。

【光影与色彩】
- 光线：黄金时刻的自然阳光，温暖而柔和，最大程度勾勒物体的立体感和真实质感。
- 色彩：高度饱和但自然的色彩，避免过度处理。HDR 效果，但不失真。
- 对比度：自然的光影对比，突出物体的体积感。

【技术规格】
Photorealistic, 8K resolution, HDR, RAW photo style, highly detailed textures (fur, metal, water, bark, skin), vivid but natural colors, optical accuracy, no distortion, deep depth of field, golden hour lighting, National Geographic photography style.
Aspect ratio: 16:9 
`


export const PIXAR_PROMPT_TEMPLATE = `
【皮克斯3D动画风格自拍场景】

【全局设定】
一张充满欢乐气息的皮克斯风格3D动画场景，主题为《{THEME_PLACEHOLDER}》。整体采用皮克斯电影级别的3D渲染风格，具有标志性的圆润角色设计、温暖柔和的光效、明亮鲜艳的色调。场景充满活力、幽默、温馨的欢乐气息，就像从皮克斯动画电影中截取的一帧精彩画面。

【场景构成】
场景环境：{ENV_ELEMENTS_PLACEHOLDER}
背景具有皮克斯动画电影般的可爱氛围与电影级构图感，整体画面充满活力、幽默、温馨的欢乐气息。

【人物组合与自拍设置】
{CORE_OBJECTS_PLACEHOLDER}在{ENV_ELEMENTS_PLACEHOLDER}中欢乐自拍留念。

主视角人物（中央位置）：
- 站在画面中央，手持自拍杆（上面连着一部iPhone手机）
- 表情为{DETAILED_ITEMS_PLACEHOLDER}中的主要特征
- 呈现出领导/核心人物气质
- 身体语言充满自信与热情

左侧人物：
- 展现出活泼、友好的动作/姿势
- 表情为开心、兴奋的表情特征
- 体现出配角的性格特点
- 做出辅助性的自拍姿势

右侧人物：
- 摆出搞怪、豪迈或可爱的姿势
- 手持代表性物品或做出夸张手势
- 表情为欢乐、调皮的表情特征
- 风格活泼夸张，展现出独特的性格特征

【人物设计要求】
- 所有人物穿着色彩鲜艳、圆润可爱的改良服饰
- 角色设计遵循皮克斯风格：大眼睛、圆润脸型、友善表情
- 所有人物表情丰富、动作生动、充满个性
- 人物之间的互动自然、温馨、充满友谊感

【光效与色彩】
- 整体光效柔和温暖、色调明亮
- 采用皮克斯标志性的柔和阴影和高光
- 色彩饱和度高但不失和谐，具有电影级的色彩分级
- 背景光线营造出温馨、欢乐的氛围

【技术规格】
Pixar 3D animation style, movie-level rendering, warm and soft lighting, bright and vibrant colors, rounded character design, expressive faces, dynamic poses, cinematic composition, 8K ultra HD, Pixar movie screenshot quality, joyful and heartwarming atmosphere.

【最后修改】
请将以上所有<人物组合>、<场景环境>、<主视角人物>、<人物A>、<人物B>等占位符替换为具体的人物名称和场景描述。
`


// ==================== 绘本故事 Prompt 模板 ====================

export const STORYBOOK_STORY_PROMPT = `
你是一位享誉世界的儿童绘本作家、儿童心理学专家和蒙台梭利教育专家。你的作品曾获得凯迪克金奖，深受全球儿童和家长喜爱。

请为一位 {AGE} 岁的孩子（名字叫 {CHILD_NAME}）创作一本专业的儿童绘本。

【故事主题】{THEME}
【核心教育目标】{SPECIFIC_NEEDS}
【艺术风格】{ART_STYLE}
【主角外观描述】{CHARACTER_DESCRIPTION}

═══════════════════════════════════════════════════════════════
                        创作原则（必须严格遵守）
═══════════════════════════════════════════════════════════════

【一、儿童发展心理学原则】
1. 认知发展阶段适配：
   - 2-4岁：使用简单重复句式，具象化表达，避免抽象概念
   - 4-6岁：可引入简单因果关系，情感词汇丰富化
   - 6-8岁：可有适度冲突和解决，引入道德思考

2. 情感安全原则：
   - 故事必须有安全的情感基调
   - 恐惧/焦虑情节必须有温暖的化解
   - 结局必须给予孩子希望和力量感

3. 共情式叙事：
   - 让孩子看到"和我一样"的角色
   - 角色的情绪变化要真实可信
   - 避免说教，让孩子自己感悟

【二、蒙台梭利教育理念融入】
1. 尊重儿童的内在发展节奏
2. 通过故事培养独立性和自信心
3. 融入感官体验描写（看到、听到、摸到、闻到）
4. 鼓励探索和发现，而非被动接受

【三、语言艺术要求】
1. 韵律感：适当使用押韵、重复、排比
2. 画面感：每句话都能在脑海中形成画面
3. 互动性：可设计让家长和孩子互动的环节
4. 文化适配：使用地道的中文表达，融入中国文化元素

═══════════════════════════════════════════════════════════════
                        故事结构要求
═══════════════════════════════════════════════════════════════

故事必须包含 15 页，结构如下：

【第1页 - 封面】
- 文字：简短的引子或开场白（1-2句话）
- 插画提示词：设计一个吸引眼球的封面场景，展现故事主题和主角，像真正的儿童绘本封面

【第2-3页 - 开篇】建立角色和情境，让孩子快速产生认同
【第4-7页 - 发展】展开故事，引入挑战或问题
【第8-11页 - 高潮】情感最强烈的部分，角色面对并克服困难
【第12-14页 - 结局】温暖收尾，传递核心价值观，给予力量感

【第15页 - 封底】
- 文字：温馨的结束语或寄语（1-2句话）
- 插画提示词：设计一个温馨的结束画面，主角快乐满足的场景，给人希望和力量

═══════════════════════════════════════════════════════════════
                        插画提示词要求（极其重要）
═══════════════════════════════════════════════════════════════

为每一页提供详细的英文插画提示词（imagePrompt），必须包含：

1. 【角色一致性锚点】（每页必须包含，一字不差）：
   "Based on the character sheet: {CHARACTER_SHEET}"

2. 【场景描述】：具体的环境、光线、氛围
3. 【角色动作】：清晰的肢体语言和表情
4. 【情感基调】：画面传递的情绪
5. 【构图建议】：视角、焦点、景深

6. 【技术参数】（每页必须包含）：
   "Style: {ART_STYLE}. High quality children's book illustration, soft lighting, warm colors, child-friendly, no text in image, professional color grading, 8K resolution."

═══════════════════════════════════════════════════════════════

请以 JSON 格式返回结果：
{
  "title": "绘本标题（要有诗意和吸引力）",
  "characterSheet": {
    "main": "主角的外观描述，例如：{CHILD_NAME}, a 5-year-old Chinese boy with a round face, big eyes, short black hair, wearing a blue striped t-shirt and jeans.",
    "others": {
      "爸爸": "A gentle-looking Chinese father in his 30s, with short black hair, wearing glasses and a light blue polo shirt.",
      "妈妈": "A kind Chinese mother in her 30s, with shoulder-length hair, wearing a yellow dress.",
      "小狗": "A fluffy, small white puppy with a red collar."
    }
  },
  "pages": [
    {
      "pageNumber": 1,
      "text": "故事文字（优美、有韵律感）",
      "imagePrompt": "详细的英文插画提示词（必须包含角色锚点）"
    }
  ]
}
`

export const STORYBOOK_IMAGE_PROMPT = `
【绘本插画生成 - 专业级提示词】

═══════════════════════════════════════════════════════════════
                        核心要求
═══════════════════════════════════════════════════════════════

【角色一致性（最高优先级）】
{CHARACTER_SHEET}

【本页场景】
{PAGE_PROMPT}

═══════════════════════════════════════════════════════════════
                        画面质量要求
═══════════════════════════════════════════════════════════════

【艺术风格】
{ART_STYLE}

【技术规格】
- Aspect Ratio: MUST be 1:1 square format
- Resolution: 8K Ultra HD
- Lighting: Soft, warm, volumetric lighting with gentle shadows
- Color palette: Rich but harmonious, child-friendly colors
- Composition: Professional children's book illustration, centered square composition
- Focus: Sharp focus on main character, appropriate depth of field
- Mood: Warm, inviting, emotionally resonant

【绝对禁止】
- NO text, letters, words, or watermarks in the image
- NO scary, violent, or inappropriate content
- NO distorted faces or body proportions
- NO extra limbs or anatomical errors
- NO dark or frightening atmospheres

【必须保证】
- Character consistency across all pages (same face, hair, clothing)
- Age-appropriate, wholesome imagery
- Clear storytelling through visual narrative
- Professional illustration quality
- Emotionally engaging scenes

═══════════════════════════════════════════════════════════════
`

export const CHARACTER_DESCRIPTION_EXAMPLES = [
  '一个5岁的中国小男孩，圆圆的脸蛋，大大的眼睛，短短的黑发，穿着蓝色条纹T恤和牛仔裤',
  '一个4岁的中国小女孩，扎着两个小辫子，圆脸大眼睛，穿着粉色连衣裙',
  '一个6岁的小男孩，戴着圆框眼镜，头发微卷，穿着绿色卫衣',
]

export const STORYBOOK_ART_STYLES = [
  { 
    value: 'Eric Carle collage style, textured painted tissue paper, bold colors, white clean background, artistic, handcrafted feel, layered paper textures', 
    label: '艾瑞·卡尔拼贴画风格',
    description: '《好饿的毛毛虫》风格，色彩鲜艳的拼贴画'
  },
  { 
    value: 'Soft watercolor style, Beatrix Potter inspiration, dreamy atmosphere, gentle pastel colors, delicate brushstrokes, nostalgic feel, English countryside aesthetic', 
    label: '温馨水彩风格',
    description: '《彼得兔》风格，柔和温馨的水彩画'
  },
  { 
    value: 'Hayao Miyazaki style, Studio Ghibli aesthetic, lush detailed backgrounds, vibrant saturated colors, anime inspired, magical realism, whimsical atmosphere', 
    label: '宫崎骏动画风格',
    description: '吉卜力工作室风格，治愈系动画'
  },
  { 
    value: '3D Pixar style, cute rounded characters, bright cheerful lighting, high detail render, expressive faces, warm color palette, cinematic quality', 
    label: '3D 皮克斯动画风格',
    description: '现代3D动画风格，角色可爱生动'
  },
  { 
    value: 'Soft clay animation style, claymation aesthetic, rounded shapes, tactile textures, warm lighting, handcrafted feel, stop-motion quality', 
    label: '黏土动画风格',
    description: '温暖的黏土质感，触感十足'
  },
  { 
    value: 'Traditional Chinese ink painting style, shuimo, minimalist elegant strokes, subtle color washes, poetic atmosphere, cultural heritage', 
    label: '中国水墨画风格',
    description: '传统水墨意境，诗意盎然'
  },
]
