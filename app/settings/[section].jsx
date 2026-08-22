import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import Screen from "../../components/Screen";
import AppHeader from "../../components/AppHeader";
import BackButton from "../../components/BackButton";
import { AppText, DisplayText } from "../../components/AppText";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getItchConnection, saveItchConnection } from "../../lib/itch";
import { getGithubConnection, saveGithubConnection } from "../../lib/github";
import { deletePost, fetchUserPosts, updateProfile } from "../../lib/communityApi";
import * as Clipboard from 'expo-clipboard';
import { openExternal } from "../../lib/external";
import { API_URL, SUPPORT_PIX_KEY } from "../../constants/config";
import { confirmAlert, showAlert } from "../../lib/ui";

const sections = [
  "appearance",
  "language",
  "connections",
  "account",
  "support",
  "links",
];

export default function SettingsSection() {
  const { section } = useLocalSearchParams();
  const id = String(section || "appearance");
  const {
    theme,
    mode,
    setThemeMode,
    materialYou,
    setMaterialYouEnabled,
    accent,
    accents,
    setAccentColor,
    navStyle,
    setNavigationStyle,
    density,
    setDensityMode,
    animations,
    setAnimationsEnabled,
  } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout, admin, currentUser, userRole, isUserAuthenticated, logoutUser } = useAuth();
  const router = useRouter();
  const [github, setGithub] = useState("luxjson");
  const [itch, setItch] = useState("deadsml");
  const [itchKey, setItchKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!sections.includes(id)) router.replace("/(tabs)/settings");
  }, [id, router]);

  const titleMap = useMemo(
    () => ({
      appearance: t.customization,
      language: t.language,
      connections: t.connectionsTitle,
      account: t.accountTitle,
      support: t.supportTitle,
      links: t.linksTitle,
    }),
    [t],
  );

  const saveConnections = async () => {
    setSaving(true);
    try {
      await saveGithubConnection(github);
      await saveItchConnection({ username: itch, apiKey: itchKey });
      showAlert(t.saved, t.connected);
    } catch {
      showAlert(t.error, t.apiUnavailable);
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    await setThemeMode("system");
    await setMaterialYouEnabled(true);
    await setAccentColor("blue");
    await setNavigationStyle("floating");
    await setDensityMode("comfortable");
    await setAnimationsEnabled(true);
  };

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <AppHeader title={titleMap[id] || t.settings} />
        <BackButton fallback="/(tabs)/settings" />
        {id === "appearance" ? (
          <Appearance
            t={t}
            theme={theme}
            mode={mode}
            setThemeMode={setThemeMode}
            materialYou={materialYou}
            setMaterialYouEnabled={setMaterialYouEnabled}
            accent={accent}
            accents={accents}
            setAccentColor={setAccentColor}
            navStyle={navStyle}
            setNavigationStyle={setNavigationStyle}
            density={density}
            setDensityMode={setDensityMode}
            animations={animations}
            setAnimationsEnabled={setAnimationsEnabled}
            reset={reset}
          />
        ) : null}
        {id === "language" ? (
          <Language
            t={t}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
          />
        ) : null}
        {id === "connections" ? (
          <Connections
            t={t}
            theme={theme}
            github={github}
            setGithub={setGithub}
            itch={itch}
            setItch={setItch}
            itchKey={itchKey}
            setItchKey={setItchKey}
            saving={saving}
            save={saveConnections}
          />
        ) : null}
        {id === "account" ? (
          <Account t={t} theme={theme} isAuthenticated={isAuthenticated} admin={admin} currentUser={currentUser} userRole={userRole} isUserAuthenticated={isUserAuthenticated} router={router} logout={logout} logoutUser={logoutUser} />
        ) : null}
        {id === "support" ? <Support t={t} theme={theme} language={language} /> : null}
        {id === "links" ? <Links t={t} theme={theme} /> : null}
      </ScrollView>
    </Screen>
  );
}

function Card({ children, theme }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.surfaceVariant },
      ]}
    >
      {children}
    </View>
  );
}
function ChoiceRow({ values, selected, onChange, theme }) {
  return (
    <View style={styles.choiceRow}>
      {values.map(([value, label]) => (
        <Pressable
          key={value}
          onPress={() => onChange(value)}
          style={[
            styles.choice,
            {
              borderColor:
                selected === value ? theme.primary : theme.surfaceVariant,
              backgroundColor:
                selected === value ? theme.primaryContainer : "transparent",
            },
          ]}
        >
          <AppText
            style={{
              color: selected === value ? theme.primary : theme.onSurface,
            }}
          >
            {label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
function Row({ icon, title, desc, right, theme }) {
  return (
    <View style={styles.row}>
      <View style={[styles.icon, { backgroundColor: theme.primaryContainer }]}>
        <MaterialIcons name={icon} size={22} color={theme.primary} />
      </View>
      <View style={styles.flex}>
        <AppText style={styles.title}>{title}</AppText>
        {desc ? (
          <AppText muted style={styles.desc}>
            {desc}
          </AppText>
        ) : null}
      </View>
      {right}
    </View>
  );
}
function Button({ children, theme, primary = false, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: primary ? theme.primary : theme.surfaceVariant },
      ]}
    >
      {icon ? (
        <MaterialIcons
          name={icon}
          size={19}
          color={primary ? theme.onPrimary : theme.onSurface}
        />
      ) : null}
      <AppText
        style={{
          color: primary ? theme.onPrimary : theme.onSurface,
          fontWeight: "700",
        }}
      >
        {children}
      </AppText>
    </Pressable>
  );
}

function Appearance({
  t,
  theme,
  mode,
  setThemeMode,
  materialYou,
  setMaterialYouEnabled,
  accent,
  accents,
  setAccentColor,
  navStyle,
  setNavigationStyle,
  density,
  setDensityMode,
  animations,
  setAnimationsEnabled,
  reset,
}) {
  return (
    <>
      <Card theme={theme}>
        <Row
          icon="palette"
          title={t.customization}
          desc={t.customizationDesc}
          theme={theme}
        />
        <AppText style={styles.label}>{t.materialYou}</AppText>
        <View style={styles.row}>
          <AppText muted style={styles.flex}>
            {t.materialDesc}
          </AppText>
          <Switch value={materialYou} onValueChange={setMaterialYouEnabled} />
        </View>
        <AppText style={styles.label}>{t.theme}</AppText>
        <ChoiceRow
          values={[
            ["system", t.system],
            ["light", t.light],
            ["dark", t.dark],
          ]}
          selected={mode}
          onChange={setThemeMode}
          theme={theme}
        />
        <AppText style={styles.label}>{t.accent}</AppText>
        <View style={styles.colors}>
          {Object.keys(accents).map((key) => (
            <Pressable
              key={key}
              onPress={() => setAccentColor(key)}
              style={[
                styles.color,
                {
                  backgroundColor: accents[key],
                  borderColor: accent === key ? theme.onSurface : "transparent",
                },
              ]}
              accessibilityLabel={key}
            />
          ))}
        </View>
      </Card>
      <Card theme={theme}>
        <Row
          icon="navigation"
          title={t.navigation}
          desc={t.personalizationDesc}
          theme={theme}
        />
        <ChoiceRow
          values={[
            ["floating", t.floating],
            ["classic", t.classic],
          ]}
          selected={navStyle}
          onChange={setNavigationStyle}
          theme={theme}
        />
        <AppText style={styles.label}>{t.density}</AppText>
        <ChoiceRow
          values={[
            ["compact", t.compact],
            ["comfortable", t.comfortable],
          ]}
          selected={density}
          onChange={setDensityMode}
          theme={theme}
        />
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppText style={styles.title}>{t.animations}</AppText>
            <AppText muted style={styles.desc}>
              {t.animations}
            </AppText>
          </View>
          <Switch value={animations} onValueChange={setAnimationsEnabled} />
        </View>
        <Button theme={theme} icon="restart-alt" onPress={reset}>
          {t.reset}
        </Button>
      </Card>
    </>
  );
}

function Language({ t, language, setLanguage, theme }) {
  return (
    <Card theme={theme}>
      <Row
        icon="language"
        title={t.language}
        desc={t.languageDesc}
        theme={theme}
      />
      <ChoiceRow
        values={[
          ["pt", t.portuguese],
          ["en", t.english],
          ["es", t.spanish],
          ["fr", t.french],
          ["de", t.german],
          ["it", t.italian],
        ]}
        selected={language}
        onChange={setLanguage}
        theme={theme}
      />
    </Card>
  );
}
function Field({ icon, value, onChangeText, placeholder, theme, secure }) {
  return (
    <View
      style={[
        styles.field,
        { borderColor: theme.surfaceVariant, backgroundColor: theme.surface },
      ]}
    >
      <MaterialIcons name={icon} size={20} color={theme.onSurfaceVariant} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.onSurfaceVariant}
        secureTextEntry={secure}
        autoCapitalize="none"
        style={[styles.input, { color: theme.onSurface }]}
      />
    </View>
  );
}
function Connections({
  t,
  theme,
  github,
  setGithub,
  itch,
  setItch,
  itchKey,
  setItchKey,
  saving,
  save,
}) {
  return (
    <Card theme={theme}>
      <Row
        icon="link"
        title={t.connectionsTitle}
        desc={t.connectionsDesc}
        theme={theme}
      />
      <AppText style={styles.label}>{t.github}</AppText>
      <AppText muted style={styles.desc}>
        {t.githubDesc}
      </AppText>
      <Field
        icon="code"
        value={github}
        onChangeText={setGithub}
        placeholder={t.githubUsername}
        theme={theme}
      />
      <Pressable
        onPress={() =>
          openExternal(`https://github.com/${github || "luxjson"}`)
        }
        style={styles.link}
      >
        <MaterialIcons name="open-in-new" size={19} color={theme.primary} />
        <AppText style={styles.flex}>github.com/{github || "luxjson"}</AppText>
      </Pressable>
      <Button theme={theme} primary icon="save" onPress={save}>
        {saving ? t.saving : t.save}
      </Button>
    </Card>
  );
}
function Account({t,theme,isAuthenticated,admin,currentUser,userRole,isUserAuthenticated,router,logout,logoutUser}){
 const [name,setName]=useState(currentUser?.name||''),[username,setUsername]=useState(currentUser?.username||''),[avatar,setAvatar]=useState(currentUser?.avatar_url||''),[saving,setSaving]=useState(false),[posts,setPosts]=useState([]);
 const loadPosts=async()=>{if(!isUserAuthenticated||userRole!=='user'||!currentUser?.id)return;const r=await fetchUserPosts(currentUser.id);if(r.success)setPosts(r.data||[]);};
 useEffect(()=>{setName(currentUser?.name||'');setUsername(currentUser?.username||'');setAvatar(currentUser?.avatar_url||'');},[currentUser]);
 useEffect(()=>{loadPosts();},[isUserAuthenticated,userRole,currentUser?.id]);
 const save=async()=>{setSaving(true);const r=await updateProfile({name,username,avatar_url:avatar});setSaving(false);if(r.success)showAlert(t.saved,t.saveChanges);else showAlert(t.error,r.message);};
 const removeMyPost=async(post)=>{
   const confirmed=await confirmAlert(t.deletePost||'Excluir post',t.deleteConfirm||'Tem certeza que deseja excluir este post?',{confirmText:t.deletePost||'Excluir',cancelText:t.cancel||'Cancelar'});
   if(!confirmed)return;
   const r=await deletePost(post.id);
   if(r.success){
     setPosts(current=>current.filter(item=>item.id!==post.id));
     showAlert(t.success||'Sucesso',t.deleted||'Post excluído com sucesso.');
   }else{
     showAlert(t.error||'Erro',r.message||'Não foi possível excluir o post.');
   }
 };
 if(isAuthenticated&&admin&&userRole!=='user')return <Card theme={theme}><Row icon="admin-panel-settings" title={t.accountTitle} desc={`${t.session}: admin/@${admin.username}`} theme={theme}/><Button theme={theme} primary icon="arrow-forward" onPress={()=>router.push('/admin')}>{t.openPanel}</Button><Button theme={theme} onPress={async()=>{await logout();router.replace('/login')}}>{t.logout}</Button></Card>;
 if(!isUserAuthenticated)return <Card theme={theme}><Row icon="account-circle" title={t.accountTitle} desc={t.accountDesc} theme={theme}/><Button theme={theme} primary icon="login" onPress={()=>router.push('/login')}>{t.login}</Button><Button theme={theme} onPress={()=>router.push('/register')}>{t.register}</Button></Card>;
 return <><Card theme={theme}><View style={styles.profileHeader}><View style={[styles.avatar,{backgroundColor:theme.primaryContainer}]}><AppText style={{fontSize:22,color:theme.primary,fontWeight:'800'}}>{String(name||'?').charAt(0).toUpperCase()}</AppText></View><View style={styles.flex}><DisplayText style={{fontSize:24}}>{name}</DisplayText><AppText muted>@{username} · #{currentUser?.registration_number}</AppText></View></View><AppText style={styles.label}>{t.fullName}</AppText><Field icon="person" value={name} onChangeText={setName} placeholder={t.fullName} theme={theme}/><AppText style={styles.label}>Username</AppText><Field icon="alternate-email" value={username} onChangeText={setUsername} placeholder={t.username} theme={theme}/><AppText style={styles.label}>{t.avatarUrl}</AppText><Field icon="image" value={avatar} onChangeText={setAvatar} placeholder={t.avatarUrl} theme={theme}/><Button theme={theme} primary icon="save" onPress={save}>{saving?t.saving:t.saveChanges}</Button></Card><Card theme={theme}><Row icon="forum" title={t.myPosts} theme={theme}/>{posts.map(p=><View key={p.id} style={[styles.myPost,{borderBottomColor:theme.surfaceVariant}]}><View style={styles.flex}><AppText numberOfLines={3}>{p.content}</AppText><AppText muted style={{fontSize:10}}>{new Date(p.created_at).toLocaleDateString()}</AppText></View><Pressable onPress={()=>removeMyPost(p)} hitSlop={8} accessibilityRole="button" accessibilityLabel={t.deletePost||'Excluir post'} style={[styles.deleteMyPost,{borderColor:theme.error}]}><MaterialIcons name="delete-outline" size={20} color={theme.error}/></Pressable></View>)}{!posts.length?<AppText muted>{t.noPosts||'Nenhum post ainda.'}</AppText>:null}</Card><Button theme={theme} onPress={async()=>{await logoutUser();router.replace('/login')}}>{t.logout}</Button></>;
}
function Support({ t, theme }) {
  const pixKey = SUPPORT_PIX_KEY;
  const [pixModalVisible, setPixModalVisible] = useState(false);

  const copyPix = async () => {
    if (!pixKey) return;
    await Clipboard.setStringAsync(pixKey);
    setPixModalVisible(true);
  };

  return (
    <>
      <Card theme={theme}>
        <Row
          icon="favorite"
          title={t.supportTitle}
          desc={t.supportDesc}
          theme={theme}
        />

        {pixKey ? (
          <Button
            theme={theme}
            primary
            icon="content-copy"
            onPress={copyPix}
          >
            {t.supportPix}
          </Button>
        ) : null}

        <Button
          theme={theme}
          primary
          icon="sports-esports"
          onPress={() => openExternal("https://deadsml.itch.io/")}
        >
          {t.supportItch}
        </Button>

        <Button
          theme={theme}
          primary
          icon="code"
          onPress={() => openExternal("https://github.com/luxjson")}
        >
          {t.supportGithub}
        </Button>
      </Card>

      <Modal
        visible={pixModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPixModalVisible(false)}
      >
        <View style={styles.pixOverlay}>
          <View
            style={[
              styles.pixModal,
              {
                backgroundColor: theme.card,
                borderColor: theme.surfaceVariant,
              },
            ]}
          >
            <View
              style={[
                styles.pixIcon,
                { backgroundColor: theme.primaryContainer },
              ]}
            >
              <MaterialIcons
                name="content-copy"
                size={28}
                color={theme.primary}
              />
            </View>

            <AppText style={styles.pixTitle}>
              {t.pixCopied}
            </AppText>

            <AppText muted style={styles.pixDescription}>
              {t.pixOnlyBrazil}
            </AppText>

            <View
              style={[
                styles.pixKeyBox,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceVariant,
                },
              ]}
            >
              <AppText style={styles.pixKey}>
                {pixKey}
              </AppText>
            </View>

            <Pressable
              onPress={() => setPixModalVisible(false)}
              style={[
                styles.pixButton,
                { backgroundColor: theme.primary },
              ]}
            >
              <AppText
                style={{
                  color: theme.onPrimary,
                  fontWeight: "700",
                }}
              >
                OK
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function Links({ t, theme }) {
  const links = [
    ["language", t.portfolio, "https://luxjson.is-a.dev"],
    ["dns", t.apiSite, API_URL.replace(/\/api\/?$/, "")],
    ["description", t.docs, `${API_URL.replace(/\/api\/?$/, "")}/docs`],
    ["sports-esports", "itch.io", "https://deadsml.itch.io"],
    ["code", "GitHub", "https://github.com/luxjson"],
  ];
  return (
    <Card theme={theme}>
      {links.map(([icon, label, url]) => (
        <Pressable
          key={url}
          onPress={() => openExternal(url)}
          style={styles.link}
        >
          <MaterialIcons name={icon} size={21} color={theme.primary} />
          <AppText style={styles.flex}>{label}</AppText>
          <MaterialIcons
            name="open-in-new"
            size={19}
            color={theme.onSurfaceVariant}
          />
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 135, gap: 15 },
  profileHeader:{flexDirection:"row",alignItems:"center",gap:13}, avatar:{width:64,height:64,borderRadius:22,alignItems:"center",justifyContent:"center"}, myPost:{paddingVertical:12,borderBottomWidth:1,flexDirection:"row",alignItems:"center",gap:10}, deleteMyPost:{width:36,height:36,alignItems:"center",justifyContent:"center",borderWidth:1,borderRadius:10},
  card: { borderWidth: 1, borderRadius: 28, padding: 20, gap: 15 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  title: { fontSize: 16 },
  desc: { fontSize: 12, lineHeight: 18, marginTop: 2 },
  label: { fontSize: 12, letterSpacing: 1, marginTop: 2 },
  choiceRow: { flexDirection: "column", gap: 8 },
  choice: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  colors: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  color: { width: 34, height: 34, borderRadius: 17, borderWidth: 3 },
  button: {
    minHeight: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
  },
  link: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 11 },
  field: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  input: { flex: 1, fontFamily: "LuxFirsNeue" },
  hint: { fontSize: 11, lineHeight: 16 },
  pixOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
},

pixModal: {
  width: "100%",
  maxWidth: 420,
  borderRadius: 30,
  borderWidth: 1,
  padding: 24,
  gap: 14,
},

pixIcon: {
  width: 58,
  height: 58,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "center",
},

pixTitle: {
  fontSize: 21,
  fontWeight: "700",
  textAlign: "center",
},

pixDescription: {
  fontSize: 13,
  lineHeight: 19,
  textAlign: "center",
},

pixKeyBox: {
  minHeight: 54,
  borderWidth: 1,
  borderRadius: 17,
  paddingHorizontal: 16,
  paddingVertical: 14,
  justifyContent: "center",
},

pixKey: {
  fontSize: 14,
  textAlign: "center",
  fontWeight: "600",
},

pixButton: {
  minHeight: 50,
  borderRadius: 25,
  alignItems: "center",
  justifyContent: "center",
  marginTop: 4,
},
});
