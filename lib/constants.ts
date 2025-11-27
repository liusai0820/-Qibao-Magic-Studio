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
