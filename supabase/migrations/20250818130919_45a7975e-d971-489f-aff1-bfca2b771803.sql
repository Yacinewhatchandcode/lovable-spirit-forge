-- Create table for authentic Hidden Words from Bahá'u'lláh
CREATE TABLE public.hidden_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL,
  part TEXT NOT NULL CHECK (part IN ('arabic', 'persian')),
  addressee TEXT NOT NULL, -- e.g., "O SON OF SPIRIT!", "O MY FRIENDS!"
  text TEXT NOT NULL,
  section_title TEXT, -- e.g., "Spiritual Counsel", "Divine Guidance"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hidden_words ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (spiritual guidance should be freely accessible)
CREATE POLICY "Hidden Words are publicly readable" 
ON public.hidden_words 
FOR SELECT 
USING (true);

-- Create index for efficient queries
CREATE INDEX idx_hidden_words_part ON public.hidden_words(part);
CREATE INDEX idx_hidden_words_number ON public.hidden_words(number);

-- Insert all Hidden Words from Arabic part
INSERT INTO public.hidden_words (number, part, addressee, text, section_title) VALUES
(1, 'arabic', 'HE IS THE GLORY OF GLORIES', 'This is that which hath descended from the realm of glory, uttered by the tongue of power and might, and revealed unto the Prophets of old. We have taken the inner essence thereof and clothed it in the garment of brevity, as a token of grace unto the righteous, that they may stand faithful unto the Covenant of God, may fulfill in their lives His trust, and in the realm of spirit obtain the gem of divine virtue.', 'Introduction'),
(2, 'arabic', 'O SON OF SPIRIT!', 'My first counsel is this: Possess a pure, kindly and radiant heart, that thine may be a sovereignty ancient, imperishable and everlasting.', 'Spiritual Counsel'),
(3, 'arabic', 'O SON OF SPIRIT!', 'The best beloved of all things in My sight is Justice; turn not away therefrom if thou desirest Me, and neglect it not that I may confide in thee. By its aid thou shalt see with thine own eyes and not through the eyes of others, and shalt know of thine own knowledge and not through the knowledge of thy neighbor. Ponder this in thy heart; how it behooveth thee to be. Verily justice is My gift to thee and the sign of My loving-kindness. Set it then before thine eyes.', 'Spiritual Counsel'),
(4, 'arabic', 'O SON OF MAN!', 'Veiled in My immemorial being and in the ancient eternity of My essence, I knew My love for thee; therefore I created thee, have engraved on thee Mine image and revealed to thee My beauty.', 'Spiritual Counsel'),
(5, 'arabic', 'O SON OF MAN!', 'I loved thy creation, hence I created thee. Wherefore, do thou love Me, that I may name thy name and fill thy soul with the spirit of life.', 'Spiritual Counsel'),
(6, 'arabic', 'O SON OF BEING!', 'Love Me, that I may love thee. If thou lovest Me not, My love can in no wise reach thee. Know this, O servant.', 'Spiritual Counsel'),
(7, 'arabic', 'O SON OF BEING!', 'Thy Paradise is My love; thy heavenly home, reunion with Me. Enter therein and tarry not. This is that which hath been destined for thee in Our kingdom above and Our exalted dominion.', 'Spiritual Counsel'),
(8, 'arabic', 'O SON OF MAN!', 'If thou lovest Me, turn away from thyself; and if thou seekest My pleasure, regard not thine own; that thou mayest die in Me and I may eternally live in thee.', 'Spiritual Counsel'),
(9, 'arabic', 'O SON OF SPIRIT!', 'There is no peace for thee save by renouncing thyself and turning unto Me; for it behooveth thee to glory in My name, not in thine own; to put thy trust in Me and not in thyself, since I desire to be loved alone and above all that is.', 'Spiritual Counsel'),
(10, 'arabic', 'O SON OF BEING!', 'My love is My stronghold; he that entereth therein is safe and secure, and he that turneth away shall surely stray and perish.', 'Spiritual Counsel'),
(11, 'arabic', 'O SON OF UTTERANCE!', 'Thou art My stronghold; enter therein that thou mayest abide in safety. My love is in thee, know it, that thou mayest find Me near unto thee.', 'Divine Guidance'),
(12, 'arabic', 'O SON OF BEING!', 'Thou art My lamp and My light is in thee. Get thou from it thy radiance and seek none other than Me. For I have created thee rich and have bountifully shed My favor upon thee.', 'Divine Guidance'),
(13, 'arabic', 'O SON OF BEING!', 'With the hands of power I made thee and with the fingers of strength I created thee; and within thee have I placed the essence of My light. Be thou content with it and seek naught else, for My work is perfect and My command is binding. Question it not, nor have a doubt thereof.', 'Divine Guidance'),
(14, 'arabic', 'O SON OF SPIRIT!', 'I created thee rich, why dost thou bring thyself down to poverty? Noble I made thee, wherewith dost thou abase thyself? Out of the essence of knowledge I gave thee being, why seekest thou enlightenment from anyone beside Me? Out of the clay of love I molded thee, how dost thou busy thyself with another? Turn thy sight unto thyself, that thou mayest find Me standing within thee, mighty, powerful and self-subsisting.', 'Divine Guidance'),
(15, 'arabic', 'O SON OF MAN!', 'Thou art My dominion and My dominion perisheth not; wherefore fearest thou thy perishing? Thou art My light and My light shall never be extinguished; why dost thou dread extinction? Thou art My glory and My glory fadeth not; thou art My robe and My robe shall never be outworn. Abide then in thy love for Me, that thou mayest find Me in the realm of glory.', 'Divine Guidance'),
(16, 'arabic', 'O SON OF UTTERANCE!', 'Turn thy face unto Mine and renounce all save Me; for My sovereignty endureth and My dominion perisheth not. If thou seekest another than Me, yea, if thou searchest the universe forevermore, thy quest will be in vain.', 'Divine Unity'),
(17, 'arabic', 'O SON OF LIGHT!', 'Forget all save Me and commune with My spirit. This is of the essence of My command, therefore turn unto it.', 'Divine Unity'),
(18, 'arabic', 'O SON OF MAN!', 'Be thou content with Me and seek no other helper. For none but Me can ever suffice thee.', 'Divine Unity'),
(19, 'arabic', 'O SON OF SPIRIT!', 'Ask not of Me that which We desire not for thee, then be content with what We have ordained for thy sake, for this is that which profiteth thee, if therewith thou dost content thyself.', 'Divine Unity'),
(20, 'arabic', 'O SON OF THE WONDROUS VISION!', 'I have breathed within thee a breath of My own Spirit, that thou mayest be My lover. Why hast thou forsaken Me and sought a beloved other than Me?', 'Divine Unity'),
(21, 'arabic', 'O SON OF SPIRIT!', 'My claim on thee is great, it cannot be forgotten. My grace to thee is plenteous, it cannot be veiled. My love has made in thee its home, it cannot be concealed. My light is manifest to thee, it cannot be obscured.', 'Divine Love'),
(22, 'arabic', 'O SON OF MAN!', 'Upon the tree of effulgent glory I have hung for thee the choicest fruits, wherefore hast thou turned away and contented thyself with that which is less good? Return then unto that which is better for thee in the realm on high.', 'Divine Love'),
(23, 'arabic', 'O SON OF SPIRIT!', 'Noble have I created thee, yet thou hast abased thyself. Rise then unto that for which thou wast created.', 'Divine Love'),
(24, 'arabic', 'O SON OF THE SUPREME!', 'To the eternal I call thee, yet thou dost seek that which perisheth. What hath made thee turn away from Our desire and seek thine own?', 'Divine Love'),
(25, 'arabic', 'O SON OF MAN!', 'Transgress not thy limits, nor claim that which beseemeth thee not. Prostrate thyself before the countenance of thy God, the Lord of might and power.', 'Divine Love'),
(26, 'arabic', 'O SON OF BEING!', 'How couldst thou forget thine own faults and busy thyself with the faults of others? Whoso doeth this is accursed of Me.', 'Divine Justice and Wisdom'),
(27, 'arabic', 'O SON OF MAN!', 'Breathe not the sins of others so long as thou art thyself a sinner. Shouldst thou transgress this command, accursed wouldst thou be, and to this I bear witness.', 'Divine Justice and Wisdom'),
(28, 'arabic', 'O SON OF SPIRIT!', 'Know thou of a truth: He that biddeth men be just and himself committeth iniquity is not of Me, even though he bear My name.', 'Divine Justice and Wisdom'),
(29, 'arabic', 'O SON OF BEING!', 'Ascribe not to any soul that which thou wouldst not have ascribed to thee, and say not that which thou doest not. This is My command unto thee, do thou observe it.', 'Divine Justice and Wisdom'),
(30, 'arabic', 'O SON OF MAN!', 'Deny not My servant should he ask anything from thee, for his face is My face; be then abashed before Me.', 'Divine Justice and Wisdom'),
(31, 'arabic', 'O SON OF BEING!', 'Bring thyself to account each day ere thou art summoned to a reckoning; for death, unheralded, shall come upon thee and thou shalt be called to give account for thy deeds.', 'Divine Justice and Wisdom'),
(32, 'arabic', 'O SON OF THE SUPREME!', 'I have made death a messenger of joy to thee. Wherefore dost thou grieve? I made the light to shed on thee its splendor. Why dost thou veil thyself therefrom?', 'Divine Justice and Wisdom'),
(33, 'arabic', 'O SON OF SPIRIT!', 'With the joyful tidings of light I hail thee: rejoice! To the court of holiness I summon thee; abide therein that thou mayest live in peace for evermore.', 'Divine Justice and Wisdom'),
(34, 'arabic', 'O SON OF SPIRIT!', 'The spirit of holiness beareth unto thee the joyful tidings of reunion; wherefore dost thou grieve? The spirit of power confirmeth thee in His cause; why dost thou veil thyself? The light of His countenance doth lead thee; how canst thou go astray?', 'Divine Justice and Wisdom'),
(35, 'arabic', 'O SON OF MAN!', 'Sorrow not save that thou art far from Us. Rejoice not save that thou art drawing near and returning unto Us.', 'Divine Justice and Wisdom'),
(36, 'arabic', 'O SON OF MAN!', 'Rejoice in the gladness of thine heart, that thou mayest be worthy to meet Me and to mirror forth My beauty.', 'Divine Joy and Contentment'),
(37, 'arabic', 'O SON OF MAN!', 'Divest not thyself of My beauteous robe, and forfeit not thy portion from My wondrous fountain, lest thou shouldst thirst for evermore.', 'Divine Joy and Contentment'),
(38, 'arabic', 'O SON OF BEING!', 'Walk in My statutes for love of Me and deny thyself that which thou desirest if thou seekest My pleasure.', 'Divine Joy and Contentment'),
(39, 'arabic', 'O SON OF MAN!', 'Neglect not My commandments if thou lovest My beauty, and forget not My counsels if thou wouldst attain My good pleasure.', 'Divine Joy and Contentment'),
(40, 'arabic', 'O SON OF MAN!', 'Wert thou to speed through the immensity of space and traverse the expanse of heaven, yet thou wouldst find no rest save in submission to Our command and humbleness before Our Face.', 'Divine Joy and Contentment'),
(41, 'arabic', 'O SON OF MAN!', 'Magnify My cause that I may reveal unto thee the mysteries of My greatness and shine upon thee with the light of eternity.', 'Divine Joy and Contentment'),
(42, 'arabic', 'O SON OF MAN!', 'Humble thyself before Me, that I may graciously visit thee. Arise for the triumph of My cause, that while yet on earth thou mayest obtain the victory.', 'Divine Joy and Contentment'),
(43, 'arabic', 'O SON OF BEING!', 'Make mention of Me on My earth, that in My heaven I may remember thee, thus shall Mine eyes and thine be solaced.', 'Divine Joy and Contentment'),
(44, 'arabic', 'O SON OF THE THRONE!', 'Thy hearing is My hearing, hear thou therewith. Thy sight is My sight, do thou see therewith, that in thine inmost soul thou mayest testify unto My exalted sanctity, and I within Myself may bear witness unto an exalted station for thee.', 'Divine Joy and Contentment'),
(45, 'arabic', 'O SON OF BEING!', 'Seek a martyr''s death in My path, content with My pleasure and thankful for that which I ordain, that thou mayest repose with Me beneath the canopy of majesty behind the tabernacle of glory.', 'Divine Sacrifice and Martyrdom'),
(46, 'arabic', 'O SON OF MAN!', 'Ponder and reflect. Is it thy wish to die upon thy bed, or to shed thy lifeblood on the dust, a martyr in My path, and so become the manifestation of My command and the revealer of My light in the highest paradise? Judge thou aright, O servant!', 'Divine Sacrifice and Martyrdom'),
(47, 'arabic', 'O SON OF MAN!', 'By My beauty! To tinge thy hair with thy blood is greater in My sight than the creation of the universe and the light of both worlds. Strive then to attain this, O servant!', 'Divine Sacrifice and Martyrdom'),
(48, 'arabic', 'O SON OF MAN!', 'For everything there is a sign. The sign of love is fortitude under My decree and patience under My trials.', 'Divine Sacrifice and Martyrdom'),
(49, 'arabic', 'O SON OF MAN!', 'The true lover yearneth for tribulation even as doth the rebel for forgiveness and the sinful for mercy.', 'Divine Sacrifice and Martyrdom'),
(50, 'arabic', 'O SON OF MAN!', 'If adversity befall thee not in My path, how canst thou walk in the ways of them that are content with My pleasure? If trials afflict thee not in thy longing to meet Me, how wilt thou attain the light in thy love for My beauty?', 'Divine Sacrifice and Martyrdom'),
(51, 'arabic', 'O SON OF MAN!', 'My calamity is My providence, outwardly it is fire and vengeance, but inwardly it is light and mercy. Hasten thereunto that thou mayest become an eternal light and an immortal spirit. This is My command unto thee, do thou observe it.', 'Divine Sacrifice and Martyrdom'),
(52, 'arabic', 'O SON OF MAN!', 'Should prosperity befall thee, rejoice not, and should abasement come upon thee, grieve not, for both shall pass away and be no more.', 'Divine Sacrifice and Martyrdom'),
(53, 'arabic', 'O SON OF BEING!', 'If poverty overtake thee, be not sad; for in time the Lord of wealth shall visit thee. Fear not abasement, for glory shall one day rest on thee.', 'Divine Sacrifice and Martyrdom'),
(54, 'arabic', 'O SON OF BEING!', 'If thine heart be set upon this eternal, imperishable dominion, and this ancient, everlasting life, forsake this mortal and fleeting sovereignty.', 'Divine Sacrifice and Martyrdom'),
(55, 'arabic', 'O SON OF BEING!', 'Busy not thyself with this world, for with fire We test the gold, and with gold We test Our servants.', 'Divine Sacrifice and Martyrdom'),
(56, 'arabic', 'O SON OF MAN!', 'Thou dost wish for gold and I desire thy freedom from it. Thou thinkest thyself rich in its possession, and I recognize thy wealth in thy sanctity therefrom. By My life! This is My knowledge, and that is thy fancy; how can My way accord with thine?', 'Divine Wealth and Detachment'),
(57, 'arabic', 'O SON OF MAN!', 'Bestow My wealth upon My poor, that in heaven thou mayest draw from stores of unfading splendor and treasures of imperishable glory. But by My life! To offer up thy soul is a more glorious thing couldst thou but see with Mine eye.', 'Divine Wealth and Detachment'),
(58, 'arabic', 'O SON OF MAN!', 'The temple of being is My throne; cleanse it of all things, that there I may be established and there I may abide.', 'Divine Wealth and Detachment'),
(59, 'arabic', 'O SON OF BEING!', 'Thy heart is My home; sanctify it for My descent. Thy spirit is My place of revelation; cleanse it for My manifestation.', 'Divine Wealth and Detachment'),
(60, 'arabic', 'O SON OF MAN!', 'Put thy hand into My bosom, that I may rise above thee, radiant and resplendent.', 'Divine Wealth and Detachment'),
(61, 'arabic', 'O SON OF MAN!', 'Ascend unto My heaven, that thou mayest obtain the joy of reunion, and from the chalice of imperishable glory quaff the peerless wine.', 'Divine Wealth and Detachment'),
(62, 'arabic', 'O SON OF MAN!', 'Many a day hath passed over thee whilst thou hast busied thyself with thy fancies and idle imaginings. How long art thou to slumber on thy bed? Lift up thy head from slumber, for the Sun hath risen to the zenith, haply it may shine upon thee with the light of beauty.', 'Divine Wealth and Detachment'),
(63, 'arabic', 'O SON OF MAN!', 'The light hath shone on thee from the horizon of the sacred Mount and the spirit of enlightenment hath breathed in the Sinai of thy heart. Wherefore, free thyself from the veils of idle fancies and enter into My court, that thou mayest be fit for everlasting life and worthy to meet Me. Thus may death not come upon thee, neither weariness nor trouble.', 'Divine Wealth and Detachment'),
(64, 'arabic', 'O CHILDREN OF MEN!', 'Know ye not why We created you all from the same dust? That no one should exalt himself over the other. Ponder at all times in your hearts how ye were created. Since We have created you all from one same substance it is incumbent on you to be even as one soul, to walk with the same feet, eat with the same mouth and dwell in the same land, that from your inmost being, by your deeds and actions, the signs of oneness and the essence of detachment may be made manifest. Such is My counsel to you, O concourse of light! Heed ye this counsel that ye may obtain the fruit of holiness from the tree of wondrous glory.', 'Divine Wealth and Detachment'),
(65, 'arabic', 'O YE SONS OF SPIRIT!', 'Ye are My treasury, for in you I have treasured the pearls of My mysteries and the gems of My knowledge. Guard them from the strangers amidst My servants and from the ungodly amongst My people.', 'Divine Wealth and Detachment'),
(66, 'arabic', 'O SON OF HIM THAT STOOD BY HIS OWN ENTITY IN THE KINGDOM OF HIS SELF!', 'Know thou, that I have wafted unto thee all the fragrances of holiness, have fully revealed to thee My word, have perfected through thee My bounty and have desired for thee that which I have desired for My Self. Be then content with My pleasure and thankful unto Me.', 'Divine Wealth and Detachment'),
(67, 'arabic', 'O SON OF MAN!', 'Write all that We have revealed unto thee with the ink of light upon the tablet of thy spirit. Should this not be in thy power, then make thine ink of the essence of thy heart. If this thou canst not do, then write with that crimson ink that hath been shed in My path. Sweeter indeed is this to Me than all else, that its light may endure forever.', 'Divine Wealth and Detachment');