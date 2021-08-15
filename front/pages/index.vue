<template>
  <div class="w-screen h-screen">
    <!-- <header class="absolute z-20 flex items-center justify-between w-full px-8 py-4 bg-gray-100 shadow-lg">
      <div class="flex items-center justify-center">
        <p class="mr-8">DBY</p>
        <div class="flex items-center justify-center">
          <button v-on:click="GotoEdit()" class="px-4 py-2 text-gray-100 bg-blue-600 rounded-lg">
            Editer le drapeau
          </button>
          <button v-on:click="GotoAccueil()" :class="'rounded-lg hover:bg-gray-300 mx-8 px-4 py-2 '+((this.ShowAccueil) ? this.focus : '')">
            Accueil
          </button>
          <button v-on:click="GotoAPropos()" :class="'rounded-lg hover:bg-gray-300 px-4 py-2 '+((this.ShowAPropos) ? this.focus : '')">
            A propos
          </button>
        </div>
      </div>
      <div>
        <button v-on:click="GotoAPropos()" class="px-4 py-2 mx-8 border-2 border-gray-400 rounded-lg hover:bg-gray-300">
          S'inscrire
        </button>
        <button v-on:click="GotoAPropos()" class="px-4 py-2 text-gray-100 bg-blue-600 rounded-lg">
          Se connecter
        </button>
      </div>
    </header> -->
    <the-header class="absolute z-20"/>
    <Flag v-show="this.ShowAccueil" class="absolute inset-0 z-10 w-full h-full"/>
    <APropos v-if="this.ShowAPropos" class="absolute inset-0 z-10 w-full h-full"/>
    <Edit v-if="this.ShowEdit" class="absolute inset-0 z-10 w-full h-full"/>
  </div>
</template>

<script>
import Flag from '@/components/Flag.vue'
import APropos from '@/components/APropos.vue'
import Edit from '@/components/Edit.vue'

export default {
  layout: "default",
  name: 'index',
  components: { 
    Flag, 
    APropos, 
    Edit
    },
  mounted() {
    this.$nuxt.$on('FlagClick', () => {
        this.GotoEdit()
        this.$router.push({name: 'edit'})
        })
    this.$nuxt.$on('click', (e)=> {
      console.log(e)
    })
  },
  data() {
    return {
      Flag: true,
      focus: "text-blue-600",
      ShowAccueil: true,
      ShowAPropos: false,
      ShowEdit: false,
    }
  },
  methods: {
    GotoAccueil() {
      this.ShowAccueil = true
      this.ShowAPropos = false
      this.ShowEdit = false
    },
    GotoAPropos() {
      this.ShowAPropos = true
      this.ShowAccueil = false
      this.ShowEdit = false
    },
    GotoEdit() {
      this.ShowAPropos = false
      this.ShowAccueil = false
      this.ShowEdit = true  
    }
  }
}
</script>

<style scoped></style>
