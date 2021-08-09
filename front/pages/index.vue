<template>
  <div class="w-screen h-screen">
    <header class="w-full absolute flex justify-between items-center py-4 px-8 bg-gray-100 z-20 shadow-lg">
      <div class="flex justify-center items-center">
        <p class="mr-8">DBY</p>
        <div class="flex justify-center items-center">
          <button v-on:click="GotoEdit()" class="rounded-lg bg-blue-600 text-gray-100 px-4 py-2">
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
        <button v-on:click="GotoAPropos()" class="rounded-lg border-2 border-gray-400 hover:bg-gray-300 mx-8 px-4 py-2">
          S'inscrire
        </button>
        <button v-on:click="GotoAPropos()" class="rounded-lg bg-blue-600 text-gray-100 px-4 py-2">
          Se connecter
        </button>
      </div>
    </header>
    <Flag v-show="this.ShowAccueil" class="w-full h-full inset-0 absolute z-10"/>
    <APropos v-if="this.ShowAPropos" class="w-full h-full inset-0 absolute z-10"/>
    <Edit v-if="this.ShowEdit" class="w-full h-full inset-0 absolute z-10"/>
  </div>
</template>

<script>
import Flag from '@/components/Flag.vue'
import APropos from '@/components/APropos.vue'
import Edit from '@/components/Edit.vue'

export default {
  layout: "default",
  components: { Flag, APropos, Edit },
  mounted() {
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

<style>
</style>
